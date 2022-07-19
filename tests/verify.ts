import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { server } from '../src/app';

import AppDataSource from "../src/db";
import User from "../src/models/db/user";

const userRepository = AppDataSource.getRepository(User);

export default function verify_test(){
    let adminToken: string;
    let customerToken: string;
    const customerLogin = {
        username: 'a',
        password: 'a'
    }
    const customerRegistration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    }
    const adminLogin = {
        username: 'b',
        password: 'b'
    }
    const adminRegistration = {
        username: 'b',
        password: 'b',
        name: 'b',
        foto_ktp: "b.jpg",
        is_verified: true,
        is_admin: true
    }

    beforeAll(async () => {
        const admin = adminRegistration as User;
        const hash_salt = await bcrypt.genSalt();
        admin.password = await bcrypt.hash('b', hash_salt)
        await userRepository.save(admin);

        const res = await request(server).post('/api/login').send(adminLogin);
        adminToken = res.text;
    })
    beforeEach(async () => {
        const customer = customerRegistration as User;
        const hash_salt = await bcrypt.genSalt();
        customer.password = await bcrypt.hash('a', hash_salt)
        await userRepository.save(customer);

        const res = await request(server).post('/api/login').send(customerLogin);
        customerToken = res.text;
    });
    afterEach(async () => {
        await userRepository.delete({ username: customerLogin.username });
    })
    afterAll(async () => {
        await userRepository.delete({ username: adminLogin.username });
    })

    it('should update user status if valid request is given and the sender is admin', async () => {
        const res = await request(server)
                            .post('/api/verify')
                            .set('x-auth-token', adminToken)
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(200);

        let user = res.body as User;
        expect(user.username).toBe(customerLogin.username);
        expect(user.is_verified).toBe(true);

        user = await userRepository.findOneBy({ username: customerLogin.username }) || new User();
        expect(user.username).toBe(customerLogin.username);
        expect(user.is_verified).toBe(true);
    });

    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        // No token
        let res = await request(server)
                            .post('/api/verify')
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(401);

        // Malformed token
        res = await request(server)
                            .post('/api/verify')
                            .set('x-auth-token', 'abc')
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(401);

        // Invalid token
        let invalidToken = jwt.sign({ username: 'a', is_admin: true }, 'invalid_key');
        res = await request(server)
                            .post('/api/verify')
                            .set('x-auth-token', invalidToken)
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(401);
    });

    it('should return 401 status code if user is not an admin', async () => {
        const res = await request(server)
                            .post('/api/verify')
                            .set('x-auth-token', customerToken)
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(401);
    });

    it('should return 400 status code if request is invalid (no username)', async () => {
        const res = await request(server)
                            .post('/api/verify')
                            .set('x-auth-token', adminToken)
                            .send({ });
        expect(res.statusCode).toBe(400);
    });
}
