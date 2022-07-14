import "reflect-metadata";
import request from "supertest";

import { server } from "../src/app";
import AppDataSource from "../src/db";
import User from "../src/models/user";

const userRepository = AppDataSource.getRepository(User);

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    server.close();
    await AppDataSource.destroy();
});


describe('Registration', () => {
    // Reset request data to valid one before each test case
    // Each test case can modify it to create invalid one
    let data: any = {};
    const validData = {
        username: 'a',
        password: 'a',
        name: 'a',
        foto_ktp: "a.jpg"
    };
    beforeEach(() => {
        Object.assign(data, validData);
    });
    afterEach(async () => {
        await userRepository.delete({});
    });

    it('should succesfully add a new user to database', async () => {
        const res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(200);

        const user = res.body;
        expect(user.username).toBe(data.username);
        expect(user.name).toBe(data.name);
        expect(user.foto_ktp).toBeTruthy();
        expect(user.password).not.toBe(data.password);
        expect(user.is_admin).toBe(false);

        const userDb = await userRepository.findOneBy({
            username: 'a'
        });
        expect(userDb).toBeTruthy();
        expect(userDb?.username).toBe(data.username);
        expect(userDb?.name).toBe(data.name);
        expect(userDb?.foto_ktp).toBeTruthy();
        expect(userDb?.password).not.toBe(data.password);
        expect(userDb?.is_admin).toBe(false);
    });

    it('should return 400 status code if the registration data is incomplete', async () => {
        delete data.username;
        let res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(400);

        data.username = validData.username;
        delete data.password;
        res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(400);

        data.password = validData.password;
        delete data.name;
        res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(400);

        data.name= validData.name;
        delete data.foto_ktp;
        res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(400);

        // make sure user is not in database
        const userDb = await userRepository.findOneBy({ username: validData.username });
        expect(userDb).toBeNull();
    });

    it('should return 409 status code if the given username already exists', async () => {
        let res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(200);

        // Failed if the same username is registered
        res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(409);

        // Change username to another should work
        data.username = 'b';
        res = await request(server).post('/api/register').send(data);
        expect(res.statusCode).toBe(200);
    });
});
