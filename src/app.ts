import express, { json } from 'express';
import helmet from "helmet";
import Joi from 'joi';
import { DataSource } from 'typeorm';
import User from './models/user';

const AppDataSource = new DataSource({
    type: "mysql",
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "bnmo_test",
    entities: [User],
    synchronize: true
});
const userRepository = AppDataSource.getRepository(User);

const app = express();

app.use(helmet());
app.use(json());

app.post('/api/register', async (req, res) => {
    let user = new User();
    console.log(user);
    Object.assign(user, req.body);
    user.hash_salt = "asdf";
    console.log(user);
    user = await userRepository.save(user);
    console.log(user);
    
    return res.send(user);
});

AppDataSource.initialize();

const server = app.listen(3000, () => {
    console.log('Application listening at port 3000');
});

export { server };
