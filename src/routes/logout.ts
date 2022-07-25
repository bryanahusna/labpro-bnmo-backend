import express from 'express';

const router = express.Router();

router.delete('/', (req, res) => {
    res.clearCookie('x-auth-token');
    res.send('Logout successful');
});

export default router;
