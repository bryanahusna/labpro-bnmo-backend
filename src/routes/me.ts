import express from 'express';

import AppDataSource from '../db';
import User from '../models/db/user';
import JWTContent from '../models/JWTContent';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.get('/', async (req, res) => {
    const jwtcontent = res.locals.jwtcontent as JWTContent;
    
    const user = await userRepository.findOne({ where: { username: jwtcontent.username } });
    if(!user) return res.status(404).send('User with the given username was not found');
    
    if(user.password) user.password = '';

    res.send(user);
});

export default router;