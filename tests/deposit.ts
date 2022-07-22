import "reflect-metadata";

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Deposit from "../src/models/db/deposit";
import Transaction from "../src/models/db/transaction";

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const depositRepository = AppDataSource.getRepository(Deposit);

export default function deposit_test(){
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
        await depositRepository.delete({});
        await transactionRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should return deposit transaction if valid amount and auth token is given', async () => {
        const res = await request(server)
                            .post('/api/deposit')
                            .set('x-auth-token', validToken)
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(200);

        let deposit = res.body as Deposit;
        expect(deposit.transaction.id).toBeTruthy();
        //expect(deposit..username).toBe(validLogin.username);
        expect(deposit.transaction.amount == 10).toBe(true);
        expect(deposit.transaction.made_on).toBeTruthy();
        expect(deposit.is_approved).toBe(false);

        deposit = await depositRepository.findOne({
            where: {
                transactionId: deposit.transactionId
            }, relations: {
                transaction: {
                    user: true
                }
            }
        }) as Deposit;
        expect(deposit).toBeTruthy();
        expect(deposit.transaction.id).toBeTruthy();
        expect(deposit.transaction.user.username).toBe(validLogin.username);
        expect(deposit.transaction.amount == 10).toBe(true);
        expect(deposit.transaction.made_on).toBeTruthy();
        expect(deposit.is_approved).toBe(false);
    });

    it('should return 401 status code if no token is provided', async () => {
        const res = await request(server)
                            .post('/api/deposit')
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(401);

        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 400 status code if no amount is provided', async () => {
        const res = await request(server)
                            .post('/api/deposit')
                            .set('x-auth-token', validToken)
                            .send();
        expect(res.statusCode).toBe(400);

        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 400 status code if amount is invalid (negative)', async () => {
        const res = await request(server)
                            .post('/api/deposit')
                            .set('x-auth-token', validToken)
                            .send({ amount: -1 });
        expect(res.statusCode).toBe(400);

        expect(res.body.transactionId).toBeFalsy();
    });
}
