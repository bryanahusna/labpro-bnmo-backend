import express, { json } from 'express';
import helmet from "helmet";

import AppDataSource from './db';
import register from './routes/register';

const app = express();

app.use(helmet());
app.use(json());
app.use(register);

const server = app.listen(3000, () => {
    console.log('Application listening at port 3000');
});
// Make sure database connection destroyed when server is closed
// Useful particularly in testing, to make database connection not blocking when program is termination
server.on('close', () => {
    AppDataSource.destroy();
});

export { server };
