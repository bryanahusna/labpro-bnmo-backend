import { Server } from 'http';
import request from 'supertest';
import jwt from 'jsonwebtoken';

/** Function to check whether user is authenticated, send post request (used very frequently so a dedicated function is created) */
export async function authCheckPost(server: Server, endpoint: string, payload: object){
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

/** Function to check whether user is authenticated, send get request (used very frequently so a dedicated function is created) */
export async function authCheckGet(server: Server, endpoint: string, payload: object){
        // No token
        let res = await request(server)
                            .get(endpoint)
                            .send(payload);
        expect(res.statusCode).toBe(401);

        // Malformed token
        res = await request(server)
                            .get(endpoint)
                            .set('Cookie', 'x-auth-token=abc;')
                            .send(payload);
        expect(res.statusCode).toBe(401);

        // Invalid token
        let invalidToken = jwt.sign({ username: 'a', is_admin: true }, 'invalid_key');
        res = await request(server)
                            .get(endpoint)
                            .set('Cookie', `x-auth-token=${invalidToken};`)
                            .send(payload);
        
        expect(res.statusCode).toBe(401);
}
