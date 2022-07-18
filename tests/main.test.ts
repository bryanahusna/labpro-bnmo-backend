import { server } from "../src/app";
import AppDataSource from "../src/db";
import approve_test from "./approve";
import deposit_test from "./deposit";
import login_test from "./login";
import register_test from "./register";
import transfer_test from "./transfer";
import withdraw_test from "./withdraw";

jest.setTimeout(20000);
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
describe('Withdraw', withdraw_test);
describe('Transfer', transfer_test);
describe('Approve', approve_test);
