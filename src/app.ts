import express, { json } from 'express';
import helmet from "helmet";

import AppDataSource from './db';
import register from './routes/register';
import login from './routes/login';

const app = express();
AppDataSource.initialize();

app.use(helmet());
app.use(json());
app.use('/api/register', register);
app.use('/api/login', login);

const server = app.listen(3000, () => {
    console.log('Application listening at port 3000');
});

// Make sure database connection destroyed when server is closed
// Useful particularly in testing, to make database connection not blocking when program is termination
server.on('close', () => {
    AppDataSource.destroy();
});

export { server };
