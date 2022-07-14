import { server } from "../src/app";
import AppDataSource from "../src/db";
import deposit_test from "./deposit";
import login_test from "./login";
import register_test from "./register";

afterAll(async () => {
    server.close();
    if(AppDataSource.isInitialized)
        await AppDataSource.destroy();
})

beforeAll(async () => {
    await AppDataSource.initialize();
});

describe('Login', login_test);
describe('Register', register_test);
describe('Deposit', deposit_test);
