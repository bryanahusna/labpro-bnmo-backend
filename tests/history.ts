import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { server } from '../src/app';

import AppDataSource from "../src/db";
import User from "../src/models/db/user";
import Deposit from '../src/models/db/deposit';
import Withdrawal from '../src/models/db/withdrawal';
import Transfer from '../src/models/db/transfer';
import Transaction, { TransactionType } from '../src/models/db/transaction';
import { authCheckGet, authCheckPost } from './utils/authCheck';
import { createVerifiedUser } from './utils/createUser';

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);
const transferRepository = AppDataSource.getRepository(Transfer);

export default function history_test(){
    let adminCookie: string;
    let cust1Cookie: string;
    let cust2Cookie: string;
    let deposit: Deposit;
    let withdrawal: Withdrawal;
    let transfer: Transfer;
    const cust1Login = {
        username: 'a',
        password: 'a'
    }
    const cust1Registration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    }
    const cust2Login = {
        username: 'b',
        password: 'b'
    }
    const cust2Registration = {
        username: 'b',
        password: 'b',
        name: 'b',
        foto_ktp: "b.jpg"
    }
    const adminLogin = {
        username: 'c',
        password: 'c'
    }
    const adminRegistration = {
        username: 'c',
        password: 'c',
        name: 'c',
        foto_ktp: "c.jpg",
        is_verified: true,
        is_admin: true
    }

    beforeAll(async () => {
        const adminToken = await createVerifiedUser(adminRegistration);
        adminCookie = `x-auth-token=${adminToken}`;
        
        const cust1Token = await createVerifiedUser(cust1Registration);
        cust1Cookie = `x-auth-token=${cust1Token}`;

        const cust2Token = await createVerifiedUser(cust2Registration);
        cust2Cookie = `x-auth-token=${cust2Token}`;

        let res = await request(server).post('/api/deposit').set('Cookie', cust1Cookie).send({ amount: 20 });
        deposit = res.body as Deposit;
        deposit.transaction.made_on = new Date('2022/07/01');
        await transactionRepository.save(deposit.transaction);

        res = await request(server).post('/api/withdraw').set('Cookie', cust2Cookie).send({ amount: 20 });
        withdrawal = res.body as Withdrawal;
        withdrawal.transaction.made_on = new Date('2022/07/05');
        await transactionRepository.save(withdrawal.transaction);

        res = await request(server).post('/api/transfer').set('Cookie', cust1Cookie).send({ amount: 10, to_user: cust2Login.username });
        transfer = res.body as Transfer;
        transfer.transaction.made_on = new Date('2022/07/10');
        await transactionRepository.save(transfer.transaction);
    });
    afterAll(async () => {
        await depositRepository.delete({ });
        await withdrawalRepository.delete({ });
        await transferRepository.delete({ });
        await transactionRepository.delete({ });
        await userRepository.delete({ });
    });

    it('should return all history if user is an admin', async () => {
        const res = await request(server)
                        .get('/api/history')
                        .set('Cookie', adminCookie);
        expect(res.statusCode).toBe(200);

        const transactions = res.body as Transaction[];
        expect(transactions.some((el) => el.id == deposit.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == withdrawal.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == transfer.transactionId)).toBe(true);
    });

    it('should return correct transactions with the given page and pagesize if user is admin', async () => {
        let res = await request(server)
                        .get('/api/history?pagesize=2&page=1')
                        .set('Cookie', adminCookie);
        expect(res.statusCode).toBe(200);
        
        let transactions = res.body as Transaction[];
        expect(transactions.length).toBe(2);
        expect(transactions.some((el) => el.id == deposit.transactionId)).toBe(false);
        expect(transactions.some((el) => el.id == withdrawal.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == transfer.transactionId)).toBe(true);

        res = await request(server)
                        .get('/api/history?pagesize=2&page=2')
                        .set('Cookie', adminCookie);
        expect(res.statusCode).toBe(200);
        
        transactions = res.body as Transaction[];
        expect(transactions.length).toBe(1);
        expect(transactions.some((el) => el.id == deposit.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == withdrawal.transactionId)).toBe(false);
        expect(transactions.some((el) => el.id == transfer.transactionId)).toBe(false);
    });

    it('should return only corresponding history if user is an customer', async () => {
        // Customer 1, only deposit and transfer must be retrieved
        let res = await request(server)
                        .get('/api/history')
                        .set('Cookie', cust1Cookie);
        expect(res.statusCode).toBe(200);

        let transactions = res.body as Transaction[];
        expect(transactions.some((el) => el.id == deposit.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == withdrawal.transactionId)).toBe(false);
        expect(transactions.some((el) => el.id == transfer.transactionId)).toBe(true);

        // Customer 2, only withdrawal and transfer (inbound transfer)
        res = await request(server)
                        .get('/api/history')
                        .set('Cookie', cust2Cookie);
        expect(res.statusCode).toBe(200);

        transactions = res.body as Transaction[];
        expect(transactions.some((el) => el.id == deposit.transactionId)).toBe(false);
        expect(transactions.some((el) => el.id == withdrawal.transactionId)).toBe(true);
        expect(transactions.some((el) => el.id == transfer.transactionId)).toBe(true);
    });

    it('should return 401 status code if no token is provided, or token is malformed, or token is invalid', async () => {
        await authCheckGet(server, '/api/history', {});
    });;
}
