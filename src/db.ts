import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "./config";
import Deposit from "./models/deposit";
import User from "./models/user";
import Withdrawal from "./models/withdrawal";

const AppDataSource = new DataSource({
    type: "mysql",
    username: "root",
    password: config.get("DB_PASSWORD"),
    database: "bnmo_test",
    entities: [User, Deposit, Withdrawal],
    synchronize: true
});

export default AppDataSource;
