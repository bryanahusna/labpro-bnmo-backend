import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import config from '../config';
import AppDataSource from "../db";
import User from "../models/user";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.post('/', async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().min(1).required(),
        password: Joi.string().min(1).required()
    });
    const { error } = schema.validate(req.body);
    if(error) return res.status(401).send('Invalid username or password');

    const user = await userRepository.findOneBy({ username: req.body.username });
    if(!user) return res.status(401).send('Invalid username or password');

    const passwordValid = await bcrypt.compare(req.body.password, user.password);
    if(!passwordValid) return res.status(401).send('Invalid username or password');

    const token = jwt.sign({
        username: req.body.username,
        is_admin: false
    }, config.get('JWT_PRIVATEKEY'));
    
    return res.send(token);
});

export default router;
