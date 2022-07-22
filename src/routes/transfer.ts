import express from 'express';
import Joi from 'joi';

import AppDataSource from '../db';
import JWTContent from '../models/JWTContent';
import Transfer from '../models/db/transfer';
import User from '../models/db/user';
import Transaction, { TransactionType } from '../models/db/transaction';

const router = express.Router();

const transferRepository = AppDataSource.getRepository(Transfer);
const userRepository = AppDataSource.getRepository(User);

router.post('/', async (req, res) => {
    let jwtcontent: JWTContent = res.locals.jwtcontent;

    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        to_user: Joi.string().min(1).required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let to_user = await userRepository.findOneBy({ username: req.body.to_user });
    if(!to_user) return res.status(404).send('Invalid transfer destination\' username');

    let user = await userRepository.findOneBy({ username: jwtcontent.username });
    if(!user) return res.status(404).send('Invalid transfer sender\' username');

    let transaction = new Transaction();
    transaction.user = user;
    transaction.amount = req.body.amount;
    transaction.type = TransactionType.Transfer;

    let transfer = new Transfer();
    transfer.to_user = to_user;
    
    user.balance -= transaction.amount;
    to_user.balance += transaction.amount;
    
    try{
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(user);
            await TEM.save(to_user);
            transaction = await TEM.save(transaction);
            transfer.transaction = transaction;
            transfer = await TEM.save(transfer);
        });
        
        return res.send(transfer);
    } catch(err){
        return res.status(404).send('An unknown error occured');
    }
});

export default router;
