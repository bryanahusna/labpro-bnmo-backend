import express from 'express';

import AppDataSource from '../db';
import Transaction from '../models/db/transaction';
import JWTContent from '../models/JWTContent';

const router = express.Router();
const transactionRepository = AppDataSource.getRepository(Transaction);

router.get('/', async (req, res) => {
    const jwtcontent: JWTContent = res.locals.jwtcontent;

    let pagesize: number = parseInt(req.query.pagesize?.toString() || '') || 10;
    let page: number = parseInt(req.query.page?.toString() || '') || 1;

    let transactions: Transaction[];
    let query = transactionRepository.createQueryBuilder("transaction");
    query.leftJoinAndSelect("transaction.deposit", "deposit")
             .leftJoinAndSelect("transaction.withdrawal", "withdrawal")
             .leftJoinAndSelect("transaction.transfer", "transfer")
             .leftJoinAndSelect("transaction.user", "user")
             .leftJoinAndSelect("transfer.to_user", "to_user")
    if(!jwtcontent.is_admin){
        query.where("user.username = :username", { username: jwtcontent.username })
             .orWhere("to_user.username = :tousername", { tousername: jwtcontent.username });
    }
    query.orderBy('transaction.made_on', "DESC")
         .skip((page-1) * pagesize)
         .take(pagesize);
    transactions = await query.getMany();
    
    res.send(transactions);
});

router.get('/unapproved', async (req, res) => {
    const jwtcontent: JWTContent = res.locals.jwtcontent;

    if(!jwtcontent.is_admin) return res.status(401).send('Only accessible to admin');

    let transactions: Transaction[];
    let query = transactionRepository.createQueryBuilder("transaction");
    query.leftJoinAndSelect("transaction.deposit", "deposit")
             .leftJoinAndSelect("transaction.withdrawal", "withdrawal")
             .leftJoinAndSelect("transaction.user", "user")
             .where("deposit.is_approved = false")
             .orWhere("withdrawal.is_approved = false")
             .orderBy('transaction.made_on', "DESC");
    transactions = await query.getMany();

    res.send(transactions);
});

export default router;
