import express from 'express';
import Joi from 'joi';
import { QueryFailedError } from 'typeorm';

import AppDataSource from '../db';
import Deposit from '../models/db/deposit';
import Transaction, { TransactionType } from '../models/db/transaction';
import User from '../models/db/user';
import JWTContent from '../models/JWTContent';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;

    const schema = Joi.object({
        amount: Joi.number().positive().required(),
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const user = await userRepository.findOneBy({ username: jwtcontent.username });
    if(!user) return res.status(404).send('username not found');

    let transaction = new Transaction();
    transaction.amount = req.body.amount;
    transaction.user = user;
    transaction.type = TransactionType.Deposit;

    let deposit = new Deposit();
    await AppDataSource.transaction(async (TEM) => {
        transaction = await TEM.save(transaction);
        deposit.transactionId = transaction.id;
        deposit.transaction = transaction;
        deposit = await TEM.save(deposit);
    });

    res.send(deposit);
});

export default router;
