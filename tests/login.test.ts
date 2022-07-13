import "reflect-metadata";
import { server } from "../src/app";
import request from "supertest";
import { DataSource } from "typeorm";
import User from "../src/models/user";
import AppDataSource from "../src/db";

beforeAll(async () => {
    await AppDataSource.initialize();
})

afterAll(async () => {
    await server.close();
    await AppDataSource.destroy();
});

describe('Login', () => {
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

    it('should return auth token if valid username and password are given', async () => {
        //let res = await request(server).post('/api/register').send(validRegistration);
        const res = await request(server).post('/api/login').send(validLogin);
        //const token = 
    });
});
