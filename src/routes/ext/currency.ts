import express from 'express';
import getRateToIDR from '../../external-apis/currency/getRateToIDR';

const router = express.Router();

router.get('/rate', async (req, res) => {
    const from = req.query.from?.toString();
    if(!from) return res.status(400).send('Invalid request! From currency is needed');

    if(from.length != 3) return res.status(400).send('Invalid currency code');

    try {
        const result = await getRateToIDR(from);
        
        res.send(result + '');
    } catch (error) {
        const err = error as Error;
        res.status(400).send(err.message)
    }
});

export default router;