import express from 'express';
import Joi from 'joi';

import AppDataSource from '../db';
import Deposit from '../models/db/deposit';
import JWTContent from '../models/JWTContent';
import { TransactionType } from '../models/transaction';
import User from '../models/db/user';
import Withdrawal from '../models/db/withdrawal';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;
    
    if(!jwtcontent.is_admin) return res.status(401).send('Only accessible to admin');

    const schema = Joi.object({
        transaction_type: Joi.string().min(1).required(),
        transaction_id: Joi.number().positive().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    if(req.body.transaction_type == TransactionType.Deposit){
        const deposit = await depositRepository.findOneBy({ id: req.body.transaction_id });
        if(!deposit) return res.status(400).send('Invalid transaction id');

        const user = await userRepository.findOneBy({ username: deposit?.username });
        if(!user) return res.status(400).send('Invalid username');

        user.balance += deposit.amount;
        deposit.is_approved = true;
        deposit.approved_on = new Date();
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(user);
            await TEM.save(deposit);
        });
        
        return res.send(deposit);

    } else if(req.body.transaction_type == TransactionType.Withdrawal){
        const withdrawal = await withdrawalRepository.findOneBy({ id: req.body.transaction_id });
        if(!withdrawal) return res.status(400).send('Invalid transaction id');

        const user = await userRepository.findOneBy({ username: withdrawal?.username });
        if(!user) return res.status(400).send('Invalid username');

        user.balance -= withdrawal.amount;
        withdrawal.is_approved = true;
        withdrawal.approved_on = new Date();
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(user);
            await TEM.save(withdrawal);
        });

        return res.send(withdrawal);

    } else {
        return res.status(400).send('Invalid transaction type');
    }
});

export default router;