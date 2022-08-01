import "reflect-metadata";

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Transfer from "../src/models/db/transfer";
import Transaction from "../src/models/db/transaction";
import { createVerifiedUser } from "./utils/createUser";
import { authCheckPost } from "./utils/authCheck";

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const transferRepository = AppDataSource.getRepository(Transfer);

export default function transfer_test(){
    let customerCookie1: string;
    let customerCookie2: string;

    const cust1Login = {
        username: 'a',
        password: 'a'
    };
    const cust1Registration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };

    const cust2Login = {
        username: 'b',
        password: 'b'
    };
    const cust2Registration = {
        username: 'b',
        password: 'b',
        name: 'b',
        foto_ktp: "b.jpg"
    };

    
    beforeAll(async () => {
        const token1 = await createVerifiedUser(cust1Registration);
        customerCookie1 = `x-auth-token=${token1}`;

        const token2 = await createVerifiedUser(cust2Registration);
        customerCookie2 = `x-auth-token=${token2}`;
    });
    afterAll(async () => {
        await transferRepository.delete({});
        await transactionRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should update both users balance and return transfer transaction if valid amount, destination user, and auth token is provided', async () => {
        await userRepository.update({ username: cust1Login.username }, { balance: 100 });
        await userRepository.update({ username: cust2Login.username }, { balance: 100 });

        const res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({ amount: 10, to_user: cust2Login.username });
        if(res.statusCode == 400) console.log(res.text);
        expect(res.statusCode).toBe(200);

        let transfer = res.body as Transfer;
        
        expect(transfer.transactionId).toBeTruthy();
        expect(transfer.transaction.user.username).toBe(cust1Login.username);
        expect(transfer.to_user.username).toBe(cust2Login.username);
        expect(transfer.transaction.amount).toBe(10);
        expect(transfer.transaction.made_on).toBeTruthy();

        transfer = await transferRepository.findOne({
            where: {
                transactionId: transfer.transactionId
            }, relations: {
                transaction: {
                    user: true
                },
                to_user: true
            }
        }) as Transfer;

        expect(transfer).toBeTruthy();
        expect(transfer.transactionId).toBeTruthy();
        expect(transfer.transaction.user.username).toBe(cust1Login.username);
        expect(transfer.transaction.user.balance).toBe(90);
        expect(transfer.to_user.username).toBe(cust2Login.username);
        expect(transfer.to_user.balance).toBe(110);
        expect(transfer.transaction.amount).toBe(10);
        expect(transfer.transaction.made_on).toBeTruthy();
    });

    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        await authCheckPost(server, '/api/transfer', { amount: 10, to_user: cust2Login.username });
    });

    it('should return 400 status code if no amount and/or to_user is provided', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(400);
        expect(res.body.transactionId).toBeFalsy();

        res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({ to_user: cust2Login.username });
        expect(res.statusCode).toBe(400);
        expect(res.body.transactionId).toBeFalsy();

        res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 400 status code if amount is invalid (negative)', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({ amount: -1, to_user: 'b' });
        expect(res.statusCode).toBe(400);
        expect(res.body.transactionId).toBeFalsy();
    });

    it('should return 404 status code if transfer destination username does not exists', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('Cookie', customerCookie1)
                            .send({ amount: 10, to_user: 'c' });
        expect(res.statusCode).toBe(404);
        expect(res.body.transactionId).toBeFalsy();
    })
}
