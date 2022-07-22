import express from 'express';
import Joi from 'joi';

import AppDataSource from '../db';
import JWTContent from '../models/JWTContent';
import Withdrawal from '../models/db/withdrawal';
import User from '../models/db/user';
import Transaction, { TransactionType } from '../models/db/transaction';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;

    const schema = Joi.object({
        amount: Joi.number().positive().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const user = await userRepository.findOneBy({ username: jwtcontent.username });
    if(!user) return res.status(404).send('username not found');

    let transaction = new Transaction();
    transaction.amount = req.body.amount;
    transaction.user = user;
    transaction.type = TransactionType.Withdrawal;

    let withdrawal = new Withdrawal();
    await AppDataSource.transaction(async (TEM) => {
        transaction = await TEM.save(transaction);
        withdrawal.transactionId = transaction.id;
        withdrawal.transaction = transaction;
        withdrawal = await TEM.save(withdrawal);
    });

    res.send(withdrawal);
});

export default router;
