import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import appconfig from '../appconfig';
import AppDataSource from '../db';
import JWTContent from '../models/JWTContent';
import Transfer from '../models/transfer';
import User from '../models/user';

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

    let from_user = await userRepository.findOneBy({ username: jwtcontent.username });
    if(!from_user) return res.status(404).send('Invalid transfer sender\' username');

    let transfer = new Transfer();
    transfer.from_user = from_user;
    transfer.to_user = to_user;
    transfer.amount = req.body.amount;
    
    from_user.balance -= transfer.amount;
    to_user.balance += transfer.amount;
    
    try{
        await AppDataSource.transaction(async (TEM) => {
            await TEM.save(from_user);
            await TEM.save(to_user);
            transfer = await TEM.save(transfer);
        });
        transfer.from_user.password = '';
        transfer.to_user.password = '';
        return res.send(transfer);
    } catch(err){
        return res.status(404).send('An unknown error occured');
    }
});

export default router;
