import express from 'express';
import Joi from 'joi';

import AppDataSource from '../db';
import Deposit from '../models/db/deposit';
import JWTContent from '../models/JWTContent';

const router = express.Router();
const depositRepository = AppDataSource.getRepository(Deposit);

router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;

    const schema = Joi.object({
        amount: Joi.number().positive().required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    let deposit = req.body as Deposit;
    deposit.username = jwtcontent.username;

    deposit = await depositRepository.save(deposit);
    res.send(deposit);
});

export default router;
