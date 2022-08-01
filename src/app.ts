import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import AppDataSource from './db';
import register from './routes/register';
import login from './routes/login';
import deposit from './routes/deposit';
import withdraw from './routes/withdraw';
import transfer from './routes/transfer';
import approve from './routes/approve';
import verify from './routes/verify';
import history from './routes/history';
import users from './routes/users';
import me from './routes/me';
import logout from './routes/logout';

import currency from './routes/ext/currency';

import auth from './middlewares/auth';

const app = express();
AppDataSource.initialize(); //  initialize database connection

// Middlewares
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: true, //included origin as true
    credentials: true, //included credentials as true
}));
app.use(json());

// Routes
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/deposit', auth, deposit);
app.use('/api/withdraw', auth, withdraw);
app.use('/api/transfer', auth, transfer);
app.use('/api/approve', auth, approve);
app.use('/api/verify', auth, verify);
app.use('/api/history', auth, history);
app.use('/api/me', auth, me);
app.use('/api/logout', logout);
app.use('/api/users', auth, users);

app.use('/api/ext/currency', currency);

// Start server
const server = app.listen(3001, () => {
    console.log('Application listening at port 3001');
});

// Make sure database connection destroyed when server is closed
// Useful particularly in testing, to make database connection not blocking when program is terminating
server.on('close', () => {
    if(AppDataSource.isInitialized)
        AppDataSource.destroy();
});

export { server };
