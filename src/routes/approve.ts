import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import appconfig from '../appconfig';
import AppDataSource from '../db';
import Deposit from '../models/deposit';
import { TransactionType } from '../models/transaction';
import User from '../models/user';
import Withdrawal from '../models/withdrawal';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const depositRepository = AppDataSource.getRepository(Deposit);
const withdrawalRepository = AppDataSource.getRepository(Withdrawal);

router.post('/', async (req, res) => {
    const token = req.header('x-auth-token') || '';
    if(!token) return res.status(401).send('Not logged in');
    try{
        if(!jwt.verify(token, appconfig.get('JWT_PRIVATEKEY') || '')) return res.status(401).send('Invalid login');
    } catch(err){   // if jwt malformed
        return res.status(401).send('Invalid login');
    }
    const tokenContent: any = jwt.decode(token);
    
    if(!tokenContent.is_admin) return res.status(401).send('Only accessible to admin');

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

        await AppDataSource.transaction(async (TEM) => {
            user.balance += deposit.amount;
            deposit.is_approved = true;
            deposit.approved_on = new Date();
            await TEM.save(user);
            await TEM.save(deposit);
        });
        
        return res.send(deposit);

    } else if(req.body.transaction_type == TransactionType.Withdrawal){
        const withdrawal = await withdrawalRepository.findOneBy({ id: req.body.transaction_id });
        if(!withdrawal) return res.status(400).send('Invalid transaction id');

        const user = await userRepository.findOneBy({ username: withdrawal?.username });
        if(!user) return res.status(400).send('Invalid username');

        await AppDataSource.transaction(async (TEM) => {
            user.balance -= withdrawal.amount;
            withdrawal.is_approved = true;
            withdrawal.approved_on = new Date();
            await TEM.save(user);
            await TEM.save(withdrawal);
        });

        return res.send(withdrawal);

    } else {
        return res.status(400).send('Invalid transaction type');
    }
});

export default router;