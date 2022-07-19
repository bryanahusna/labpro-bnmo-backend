import "reflect-metadata";

import { server } from "../src/app";
import request from "supertest";
import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Transfer from "../src/models/db/transfer";

const userRepository = AppDataSource.getRepository(User);
const transferRepository = AppDataSource.getRepository(Transfer);

export default function transfer_test(){
    let token1: string;
    let validToken1: string;
    let token2: string;
    let validToken2: string;

    const user1Login = {
        username: 'a',
        password: 'a'
    };
    const user1Registration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };

    const user2Login = {
        username: 'b',
        password: 'b'
    };
    const user2Registration = {
        username: 'b',
        password: 'b',
        name: 'b',
        foto_ktp: "b.jpg"
    };

    
    beforeAll(async () => {
        await request(server).post('/api/register').send(user1Registration);
        let res = await request(server).post('/api/login').send(user1Login);
        validToken1 = res.text;

        await request(server).post('/api/register').send(user2Registration);
        res = await request(server).post('/api/login').send(user2Login);
        validToken2 = res.text;
    });
    beforeEach(async () => {
        token1 = validToken1;
        token2 = validToken2;
    });
    afterAll(async () => {
        await transferRepository.delete({});
        await userRepository.delete({});
    });
    
    it('should update both users balance and return transfer transaction if valid amount, destination user, and auth token is provided', async () => {
        await userRepository.update({ username: user1Login.username }, { balance: 100 });
        await userRepository.update({ username: user2Login.username }, { balance: 100 });

        const res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({ amount: 10, to_user: user2Login.username });
        if(res.statusCode == 400) console.log(res.text);
        expect(res.statusCode).toBe(200);

        let transfer = res.body as Transfer;
        
        expect(transfer.id).toBeTruthy();
        expect(transfer.from_user.username).toBe(user1Login.username);
        expect(transfer.to_user.username).toBe(user2Login.username);
        expect(transfer.amount == 10).toBe(true);
        expect(transfer.completed_on).toBeTruthy();

        transfer = await transferRepository.findOne({
            where: {
                from_user: {
                    username: user1Login.username
                }
            }, relations: {
                from_user: true,
                to_user: true
            }
        }) as Transfer;

        expect(transfer).toBeTruthy();
        expect(transfer.id).toBeTruthy();
        expect(transfer.from_user.username).toBe(user1Login.username);
        expect(transfer.from_user.balance).toBe(90);
        expect(transfer.to_user.username).toBe(user2Login.username);
        expect(transfer.to_user.balance).toBe(110);
        expect(transfer.amount == 10).toBe(true);
        expect(transfer.completed_on).toBeTruthy();
    });

    it('should return 401 status code if no token is provided', async () => {
        const res = await request(server)
                            .post('/api/transfer')
                            .send({ amount: 10, to_user: user2Login.username });
        expect(res.statusCode).toBe(401);

        expect(res.body.id).toBeFalsy();
    });

    it('should return 401 status code if invalid token is provided', async () => {
        const res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', 'alskjdfasdfkj')
                            .send({ amount: 10, to_user: user2Login.username });
        expect(res.statusCode).toBe(401);

        expect(res.body.id).toBeFalsy();
    });

    it('should return 400 status code if no amount and/or to_user is provided', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({ amount: 10 });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();

        res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({ to_user: user2Login.username });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();

        res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();
    });

    it('should return 400 status code if amount is invalid (negative)', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({ amount: -1, to_user: 'b' });
        expect(res.statusCode).toBe(400);
        expect(res.body.id).toBeFalsy();
    });

    it('should return 404 status code if transfer destination username does not exists', async () => {
        let res = await request(server)
                            .post('/api/transfer')
                            .set('x-auth-token', validToken1)
                            .send({ amount: 10, to_user: 'c' });
        expect(res.statusCode).toBe(404);
        expect(res.body.id).toBeFalsy();
    })
}
