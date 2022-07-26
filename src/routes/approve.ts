import express from 'express';
import Joi from 'joi';

import AppDataSource from '../db';
import Deposit from '../models/db/deposit';
import JWTContent from '../models/JWTContent';
import User from '../models/db/user';
import Withdrawal from '../models/db/withdrawal';
import Transaction, { TransactionType } from '../models/db/transaction';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;
    
    if(!jwtcontent.is_admin) return res.status(401).send('Only accessible to admin');

    const schema = Joi.object({
        transaction_id: Joi.number().positive().required(),
        approved: Joi.boolean().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    
    const transaction: Transaction | null = await transactionRepository.findOne({ where: { id: req.body.transaction_id }, relations: { user: true } });
    if(!transaction) return res.status(404).send('Transaction with the given id not found');
    if(!transaction.user) return res.status(404).send('User does not exists');
    
    if(!req.body.approved){
        if(transaction.type == TransactionType.Deposit){
            await depositRepository.delete({ transactionId: transaction.id });
        } else if(TransactionType.Withdrawal){
            await withdrawalRepository.delete({ transactionId: transaction.id });
        } else{
            return res.status(400).send('Invalid transaction type');
        }
        await transactionRepository.delete({ id: transaction.id });
        return res.send('Decline successful');
    }

    const user = transaction.user;

    if(transaction.type == TransactionType.Deposit){
        const deposit = await depositRepository.findOne({ where: { transactionId: transaction.id } });
        if(!deposit) return res.status(404).send('Deposit with the given id not found');

        user.balance += transaction.amount;
        deposit.is_approved = true;
        deposit.approved_on = new Date();
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(user);
            await TEM.save(deposit);
        });
        transaction.user.password = '';
        deposit.transaction = transaction;
        return res.send(deposit);

    } else if(transaction.type == TransactionType.Withdrawal){
        const withdrawal = await withdrawalRepository.findOne({ where: { transactionId: transaction.id } });
        if(!withdrawal) return res.status(404).send('Withdrawal with the given id not found');

        user.balance -= transaction.amount;
        withdrawal.is_approved = true;
        withdrawal.approved_on = new Date();
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(user);
            await TEM.save(withdrawal);
        });
        transaction.user.password = '';
        withdrawal.transaction = transaction;
        return res.send(withdrawal);

    } else {
        return res.status(400).send('Invalid transaction type');
    }
});

export default router;