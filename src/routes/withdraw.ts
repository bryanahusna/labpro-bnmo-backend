import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import appconfig from '../appconfig';

import AppDataSource from '../db';
import Withdrawal from '../models/withdrawal';

const router = express.Router();

const depositRepository = AppDataSource.getRepository(Withdrawal);
router.post('/', async (req, res) => {
    const token = req.header('x-auth-token') || '';
    if(!token) return res.status(401).send('Not logged in');
    try{
        if(!jwt.verify(token, appconfig.get('JWT_PRIVATEKEY'))) return res.status(401).send('Invalid login');
    } catch(err){   // if jwt malformed
        return res.status(401).send('Invalid login');
    }

    const tokenContent: any = jwt.decode(token);

    const schema = Joi.object({
        amount: Joi.number().positive().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    let withdrawal = req.body as Withdrawal;
    withdrawal.username = tokenContent.username;

    withdrawal = await depositRepository.save(withdrawal);
    res.send(withdrawal);
});

export default router;
