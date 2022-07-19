import express from 'express';
import Joi from 'joi';
import AppDataSource from '../db';
import User from '../models/db/user';
import JWTContent from '../models/JWTContent';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
router.post('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;
    if(!jwtcontent.is_admin) return res.status(401).send('Only accessible to admin');

    const schema = Joi.object({
        username: Joi.string().min(1).required()
    });
    const { error } =  schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    await userRepository.update({ username: req.body.username }, { is_verified: true });
    const user = await userRepository.findOneBy({ username: req.body.username });
    return res.send(user);
});

export default router;