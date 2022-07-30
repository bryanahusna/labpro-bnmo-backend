import express from 'express';
import { FindOptionsWhere } from 'typeorm';

import AppDataSource from '../db';
import User from '../models/db/user';
import JWTContent from '../models/JWTContent';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.get('/', async (req, res) => {
    const jwtcontent: JWTContent = res.locals.jwtcontent;

    if(!jwtcontent.is_admin) return res.status(401).send('Only accessible to admin');

    let where: FindOptionsWhere<User> = {};
    if(req.query.is_verified?.toString().toLowerCase() == 'true'){
        where = { is_verified: true};
    } else if(req.query.is_verified?.toString().toLowerCase() == 'false'){
        where = { is_verified: false};
    }

    const users = await userRepository.find({
        where: where
    });
    res.send(users);
});


export default router;
