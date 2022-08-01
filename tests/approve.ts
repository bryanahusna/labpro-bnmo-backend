import "reflect-metadata";
import jwt from 'jsonwebtoken';

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Deposit from "../src/models/db/deposit";
import Withdrawal from "../src/models/db/withdrawal";
import Transaction from "../src/models/db/transaction";
import { createVerifiedUser } from "./utils/createUser";
import { authCheckPost } from "./utils/authCheck";

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

export default function approve_test(){
    let deposit: Deposit;
    let withdrawal: Withdrawal;

    let customerCookie: string;
    const customerRegistration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };

    const adminRegistration = {
        username: 'b',
        password: 'b',
        name: 'b',
        foto_ktp: "b.jpg",
        is_admin: true
    }

    let adminCookie: string;
    
    beforeAll(async () => {
        const customerToken = await createVerifiedUser(customerRegistration);
        customerCookie = `x-auth-token=${customerToken}`;

        const adminToken = await createVerifiedUser(adminRegistration);
        adminCookie = `x-auth-token=${adminToken}`;
    });

    beforeEach(async () => {
        await userRepository.update({ username: 'a' }, { balance: 100 });
        let res = await request(server).post('/api/deposit').set('Cookie', customerCookie).send({ amount: 10 });
        deposit = res.body as Deposit;

        res = await request(server).post('/api/withdraw').set('Cookie', customerCookie).send({ amount: 10 });
        withdrawal = res.body as Withdrawal;
    });

    afterAll(async () => {
        await depositRepository.delete({});
        await withdrawalRepository.delete({});
        await transactionRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should update the deposit transaction status and user\'s balance, and return the transaction', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({ transaction_id: deposit.transaction.id, approved: true });
        expect(res.statusCode).toBe(200);

        deposit = res.body as Deposit;
        expect(deposit.is_approved).toBe(true);
        
        deposit = await depositRepository.findOneBy({ transactionId: deposit.transaction.id }) || new Deposit();
        expect(deposit.is_approved).toBe(true);
        expect(deposit.approved_on).toBeTruthy();

        let user = await userRepository.findOneBy({ username: 'a' });
        expect(user?.balance).toBe(110);
    });

    it('should update the withdrawal transaction status and user\'s balance, and return the transaction', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({ transaction_id: withdrawal.transaction.id, approved: true });
        
        expect(res.statusCode).toBe(200);

        withdrawal = res.body as Withdrawal;
        expect(withdrawal.is_approved).toBe(true);

        withdrawal = await withdrawalRepository.findOneBy({ transactionId: withdrawal.transaction.id }) || new Withdrawal();
        expect(withdrawal.is_approved).toBe(true);
        expect(withdrawal.approved_on).toBeTruthy();

        let user = await userRepository.findOneBy({ username: 'a' });
        expect(user?.balance).toBe(90);
    });
    
    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        await authCheckPost(server, '/api/approve', { transaction_id: deposit.transaction.id, approved: true });
    });

    it('should return 401 status code if user is not an admin', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', customerCookie)
                            .send({ transaction_id: withdrawal.transaction.id, approved: true });
        expect(res.statusCode).toBe(401);
        expect(res.body.id).toBeFalsy();
    });


    it('should return 400 status code if no transaction id and/or approved is provided', async () => {
        // Both are not provided
        let res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();

        // transaction_id not provided
        res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({ approved: true });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();

        // approved not provided
        res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({ transaction_id: deposit.transaction.id });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();
    });

    it('should return 404 status code if  transaction id is not found', async () => {
        const res = await request(server)
                            .post('/api/approve')
                            .set('Cookie', adminCookie)
                            .send({ transaction_id: 1000000, approved: true });
        expect(res.statusCode).toBe(404);
        expect(res.body.id).toBeFalsy();
    });
}
