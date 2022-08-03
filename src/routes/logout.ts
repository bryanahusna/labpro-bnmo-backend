import express from 'express';

const router = express.Router();

router.delete('/', (req, res) => {
    res.clearCookie('x-auth-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.send('Logout successful');
});

export default router;
