import "reflect-metadata";
import { server } from "../src/app";
import request from "supertest";
import { DataSource } from "typeorm";
import User from "../src/models/user";

const AppDataSource = new DataSource({
    type: "mysql",
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "bnmo_test",
    entities: [User],
    synchronize: true
});

const userRepository = AppDataSource.getRepository(User);

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    server.close();
    //await AppDataSource.destroy();
});

describe('Registration', () => {
    afterEach(async () => {
        await userRepository.delete({});
    });

    it('should succesfully add a new user to database', async () => {
        const res = await request(server).post('/api/register').send({
            username: 'a',
            password: 'a',
            name: 'a',
            foto_ktp: "a.jpg"
        });
        const user = await userRepository.findOneBy({
            username: 'a'
        });

        expect(user).toBeTruthy();
    });
})
