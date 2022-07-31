import { Server } from 'http';
import request from 'supertest';
import jwt from 'jsonwebtoken';

export default async function authCheck(server: Server, endpoint: string, payload: object){
        // No token
        let res = await request(server)
                            .post(endpoint)
                            .send(payload);
        expect(res.statusCode).toBe(401);

        // Malformed token
        res = await request(server)
                            .post(endpoint)
                            .set('Cookie', 'x-auth-token=abc;')
                            .send(payload);
        expect(res.statusCode).toBe(401);

        // Invalid token
        let invalidToken = jwt.sign({ username: 'a', is_admin: true }, 'invalid_key');
        res = await request(server)
                            .post(endpoint)
                            .set('Cookie', `x-auth-token=${invalidToken};`)
                            .send(payload);
        
        expect(res.statusCode).toBe(401);
}
