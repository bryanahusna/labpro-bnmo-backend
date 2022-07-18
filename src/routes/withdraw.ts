import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import appconfig from '../appconfig';

import AppDataSource from '../db';
import JWTContent from '../models/JWTContent';
import Withdrawal from '../models/withdrawal';

const router = express.Router();

const depositRepository = AppDataSource.getRepository(Withdrawal);
router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;

    const schema = Joi.object({
        amount: Joi.number().positive().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    let withdrawal = req.body as Withdrawal;
    withdrawal.username = jwtcontent.username;

    withdrawal = await depositRepository.save(withdrawal);
    res.send(withdrawal);
});

export default router;
