import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import appconfig from '../appconfig';
import JWTContent from '../models/JWTContent';

export default function auth(req: Request, res: Response, next: NextFunction){
    const token = req.cookies['x-auth-token'] || '';
    if(!token) return res.status(401).send('Not logged in');

    try{
        const valid = jwt.verify(token, appconfig.get('JWT_PRIVATEKEY') || '');
        if(!valid) return res.status(401).send('Invalid login');
        
        res.locals.jwtcontent = jwt.decode(token) as JWTContent;
        next();
    } catch(err){   // if jwt malformed
        return res.status(401).send('Invalid login');
    }
}
