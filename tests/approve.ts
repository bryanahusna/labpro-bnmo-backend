import "reflect-metadata";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/user";
import Deposit from "../src/models/deposit";
import Withdrawal from "../src/models/withdrawal";
import { TransactionType } from "../src/models/transaction";

const userRepository = AppDataSource.getRepository(User);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

export default function approve_test(){
    let deposit: Deposit;
    let withdrawal: Withdrawal;

    let customerToken: string;
    const customerLogin = {
        username: 'a',
        password: 'a'
    };
    const customerRegistration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };

    let adminToken: string;
    let admin = new User();
    
    beforeAll(async () => {
        await request(server).post('/api/register').send(customerRegistration);
        let res = await request(server).post('/api/login').send(customerLogin);
        customerToken = res.text;

        admin.username = 'b';
        admin.name = 'b';
        const hash_salt = await bcrypt.genSalt();
        admin.password = await bcrypt.hash('b', hash_salt);
        admin.foto_ktp = 'b.jpg';
        admin.is_admin = true;
        admin.is_verified = true;
        admin = await userRepository.save(admin);

        res = await request(server).post('/api/login').send({ username: 'b', password: 'b' });
        adminToken = res.text;
    });

    beforeEach(async () => {
        await userRepository.update({ username: 'a' }, { balance: 100 });
        deposit = await depositRepository.save({
            username: 'a',
            amount: 10
        });
        withdrawal = await withdrawalRepository.save({
            username: 'a',
            amount: 10
        });
    });

    afterAll(async () => {
        await depositRepository.delete({});
        await withdrawalRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should update the deposit transaction status and user\'s balance, and return the transaction', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', adminToken)
                            .send({ transaction_type: TransactionType.Deposit, transaction_id: deposit.id });
        expect(res.statusCode).toBe(200);

        deposit = res.body as Deposit;
        expect(deposit.is_approved).toBe(true);
        
        deposit = await depositRepository.findOneBy({ id: deposit.id }) || new Deposit();
        expect(deposit.is_approved).toBe(true);
        expect(deposit.approved_on).toBeTruthy();

        let user = await userRepository.findOneBy({ username: 'a' });
        expect(user?.balance).toBe(110);
    });

    it('should update the withdrawal transaction status and user\'s balance, and return the transaction', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', adminToken)
                            .send({ transaction_type: TransactionType.Withdrawal, transaction_id: withdrawal.id });
        expect(res.statusCode).toBe(200);

        withdrawal = res.body as Withdrawal;
        expect(withdrawal.is_approved).toBe(true);

        withdrawal = await withdrawalRepository.findOneBy({ id: withdrawal.id }) || new Withdrawal();
        expect(withdrawal.is_approved).toBe(true);
        expect(withdrawal.approved_on).toBeTruthy();

        let user = await userRepository.findOneBy({ username: 'a' });
        expect(user?.balance).toBe(90);
    });
    
    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        // No token
        let res = await request(server)
                            .post('/api/approve')
                            .send({ transaction_type: TransactionType.Withdrawal, transaction_id: withdrawal.id });
        expect(res.statusCode).toBe(401);
        expect(res.body.id).toBeFalsy();

        // Malformed token
        res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', 'abc')
                            .send({ transaction_type: TransactionType.Withdrawal, transaction_id: withdrawal.id });
        expect(res.statusCode).toBe(401);
        expect(res.body.id).toBeFalsy();

        // Invalid token
        let invalidToken = jwt.sign({ username: 'a', is_admin: true }, 'invalid_key');
        res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', invalidToken)
                            .send({ transaction_type: TransactionType.Withdrawal, transaction_id: withdrawal.id });
        expect(res.statusCode).toBe(401);
        expect(res.body.id).toBeFalsy();
    });

    it('should return 401 status code if user is not an admin', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', customerToken)
                            .send({ transaction_type: TransactionType.Deposit, transaction_id: deposit.id });
        expect(res.statusCode).toBe(401);
        expect(res.body.id).toBeFalsy();
    });


    it('should return 400 status code if no transaction type and transaction id is provided', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', adminToken)
                            .send();
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();
    });

    it('should return 400 status code if transaction type or transaction id is invalid', async () => {
        let res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', adminToken)
                            .send({ transaction_type: 'invalid type', transaction_id: deposit.id });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();

        res = await request(server)
                            .post('/api/approve')
                            .set('x-auth-token', adminToken)
                            .send({ transaction_type: TransactionType.Deposit, transaction_id: 1000000 });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();
    });
}
