import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import appconfig from '../appconfig';
import AppDataSource from '../db';
import Transfer from '../models/transfer';
import User from '../models/user';

const router = express.Router();

const transferRepository = AppDataSource.getRepository(Transfer);
const userRepository = AppDataSource.getRepository(User);

router.post('/', async (req, res) => {
    const token = req.header('x-auth-token') || '';
    if(!token) return res.status(401).send('Not logged in');
    try{
        if(!jwt.verify(token, appconfig.get('JWT_PRIVATEKEY') || '')) return res.status(401).send('Invalid login');
    } catch(err){   // if jwt malformed
        return res.status(401).send('Invalid login');
    }

    const tokenContent: any = jwt.decode(token);

    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        to_user: Joi.string().min(1).required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let to_user = await userRepository.findOneBy({ username: req.body.to_user });
    if(!to_user) return res.status(404).send('Invalid transfer destination\' username');

    let transfer = new Transfer();
    transfer.from_user = tokenContent.username;
    transfer.to_user = req.body.to_user;
    transfer.amount = req.body.amount;
    
    try{
        transfer = await transferRepository.save(transfer);
        return res.send(transfer);
    } catch(err){
        return res.status(404).send('An unknown error occured');
    }
});

export default router;
