import "reflect-metadata";

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Withdrawal from "../src/models/db/withdrawal";
import Transaction from "../src/models/db/transaction";

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

export default function withdraw_test(){
    let token: string;
    let validToken: string;
    const validLogin = {
        username: 'a',
        password: 'a'
    };
    const validRegistration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };
    
    beforeAll(async () => {
        await request(server).post('/api/register').send(validRegistration);
        const res = await request(server).post('/api/login').send(validLogin);
        validToken = res.text;
    });
    beforeEach(() => {
        token = validToken;
    });
    afterAll(async () => {
        await withdrawalRepository.delete({});
        await transactionRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should return withdrawal transaction if valid amount and auth token is given', async () => {
        const res = await request(server)
                            .post('/api/withdraw')
                            .set('x-auth-token', validToken)
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(200);

        let withdrawal = res.body as Withdrawal;
        expect(withdrawal.transactionId).toBeTruthy();
        expect(withdrawal.transaction.user.username).toBe(validLogin.username);
        expect(withdrawal.transaction.amount == 10).toBe(true);
        expect(withdrawal.transaction.made_on).toBeTruthy();
        expect(withdrawal.is_approved).toBe(false);

        withdrawal = await withdrawalRepository.findOne({
            where: {
                transactionId: withdrawal.transactionId
            }, relations: {
                transaction: {
                    user: true
                }
            }
        }) as Withdrawal;
        expect(withdrawal).toBeTruthy();
        expect(withdrawal.transaction.id).toBeTruthy();
        expect(withdrawal.transaction.user.username).toBe(validLogin.username);
        expect(withdrawal.transaction.amount == 10).toBe(true);
        expect(withdrawal.transaction.made_on).toBeTruthy();
        expect(withdrawal.is_approved).toBe(false);
    });

    it('should return 401 status code if no token is provided', async () => {
        const res = await request(server)
                            .post('/api/withdraw')
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(401);

        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 400 status code if no amount is provided', async () => {
        const res = await request(server)
                            .post('/api/withdraw')
                            .set('x-auth-token', validToken)
                            .send();
        expect(res.statusCode).toBe(400);

        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 400 status code if amount is invalid (negative)', async () => {
        const res = await request(server)
                            .post('/api/withdraw')
                            .set('x-auth-token', validToken)
                            .send({ amount: -1 });
        expect(res.statusCode).toBe(400);

        expect(res.body.transactionId).toBeFalsy();
    });
}
