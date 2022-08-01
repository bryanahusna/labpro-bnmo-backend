import request from 'supertest';

import { server } from '../src/app';

import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import createUser, { createVerifiedUser } from './utils/createUser';
import { authCheckPost } from './utils/authCheck';

const userRepository = AppDataSource.getRepository(User);

export default function verify_test(){
    let adminCookie: string;
    let customerCookie: string;
    let verifiedCustomerCookie: string;
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
        await createVerifiedUser(adminRegistration);

        let res = await request(server).post('/api/login').send(adminLogin);
        adminCookie = res.get('Set-Cookie')[0];

        await createVerifiedUser({ username: 'c', password: 'c', foto_ktp: 'c.jpg', name: 'c' });

        res = await request(server).post('/api/login').send({ username: 'c', password: 'c' });
        
        verifiedCustomerCookie = res.get('Set-Cookie')[0];
    })
    beforeEach(async () => {
        await createUser(customerRegistration);
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
                            .set('Cookie', adminCookie)
                            .send({ username: customerLogin.username, is_verified: true });
        expect(res.statusCode).toBe(200);

        let user = res.body as User;
        expect(user.username).toBe(customerLogin.username);
        expect(user.is_verified).toBe(true);

        user = await userRepository.findOneBy({ username: customerLogin.username }) || new User();
        expect(user.username).toBe(customerLogin.username);
        expect(user.is_verified).toBe(true);
    });

    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        await authCheckPost(server, '/api/verify', { username: customerLogin.username, is_verified: true });
    });

    it('should return 401 status code if user is not an admin', async () => {
        const res = await request(server)
                            .post('/api/verify')
                            .set('Cookie', verifiedCustomerCookie)
                            .send({ username: customerLogin.username });
        expect(res.statusCode).toBe(401);
    });

    it('should return 400 status code if request is invalid (no username)', async () => {
        const res = await request(server)
                            .post('/api/verify')
                            .set('Cookie', adminCookie)
                            .send({ });
        expect(res.statusCode).toBe(400);
    });
}
