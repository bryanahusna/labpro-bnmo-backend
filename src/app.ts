import express, { json } from 'express';
import helmet from 'helmet';

import AppDataSource from './db';
import register from './routes/register';
import login from './routes/login';
import deposit from './routes/deposit';
import withdraw from './routes/withdraw';
import transfer from './routes/transfer';
import approve from './routes/approve';
import auth from './middlewares/auth';

const app = express();
AppDataSource.initialize();

app.use(helmet());
app.use(json());
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/deposit', auth, deposit);
app.use('/api/withdraw', auth, withdraw);
app.use('/api/transfer', auth, transfer);
app.use('/api/approve', auth, approve);

const server = app.listen(3000, () => {
    console.log('Application listening at port 3000');
});

// Make sure database connection destroyed when server is closed
// Useful particularly in testing, to make database connection not blocking when program is terminating
server.on('close', () => {
    if(AppDataSource.isInitialized)
        AppDataSource.destroy();
});

export { server };

