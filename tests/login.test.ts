import "reflect-metadata";
import jwt from 'jsonwebtoken'

import { server } from "../src/app";
import request from "supertest";
import { DataSource } from "typeorm";
import User from "../src/models/user";
import AppDataSource from "../src/db";

const userRepository = AppDataSource.getRepository(User);

beforeAll(async () => {
    await AppDataSource.initialize();
})

afterAll(async () => {
    await server.close();
    await AppDataSource.destroy();
});

describe('Login', () => {
    
    const login: any = {};
    const validLogin = {
        username: 'a',
        password: 'a'
    };
    const validRegistration = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };
    
    beforeEach(() => {
        Object.assign(login, validLogin);
    });

    beforeAll(async () => {
        await request(server).post('/api/register').send(validRegistration);
    });
    afterAll(async () => {
        await userRepository.delete({});
    });
    
    it('should return auth token if valid username and password is given', async () => {
        const res = await request(server).post('/api/login').send(validLogin);

        const tokenDecoded: any = jwt.decode(res.text);
        expect(tokenDecoded.username).toBe('a');
        expect(tokenDecoded.is_admin).toBe(false);
    });

    it('should return 401 status code if no username and password is given', async () => {
        delete login.username;
        let res = await request(server).post('/api/login').send(login);
        expect(res.statusCode).toBe(401);

        login.username = 'a';
        delete login.password;
        res = await request(server).post('/api/login').send(login);
        expect(res.statusCode).toBe(401);

        const tokenDecoded: any = jwt.decode(res.text);
        expect(tokenDecoded).toBeFalsy();
    });

    it('should return 401 status code if invalid username or password is given', async () => {
        login.username = 'b';
        let res = await request(server).post('/api/login').send(login);
        expect(res.statusCode).toBe(401);

        login.username = 'a';
        login.password = 'b';
        res = await request(server).post('/api/login').send(login);
        expect(res.statusCode).toBe(401);

        const tokenDecoded: any = jwt.decode(res.text);
        expect(tokenDecoded).toBeFalsy();
    });

    
});
