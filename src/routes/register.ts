import "reflect-metadata";
import Joi from 'joi';
import bcrypt from 'bcrypt';
import express from 'express';

import AppDataSource from '../db';
import User from '../models/db/user';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.post('/', async (req, res) => {
    let user = new User();
    Object.assign(user, req.body);

    const schema = Joi.object({
        username: Joi.string().max(255).required(),
        password: Joi.string().min(1).required(),
        name: Joi.string().min(1).required(),
        foto_ktp: Joi.string().min(1).required()
    });
    const { error } = schema.validate(user);
    if(error) return res.status(400).send(error.details[0].message);

    const checkDb = await userRepository.findOneBy({ username: user.username });
    if(checkDb) return res.status(409).send('username already exists');

    const hash_salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, hash_salt);

    user.is_admin = false;
    user = await userRepository.save(user);
    
    return res.send(user);
});

export default router;
