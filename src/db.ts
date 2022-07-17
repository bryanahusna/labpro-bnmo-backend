import "reflect-metadata";
import { DataSource } from "typeorm";
import appconfig from "./appconfig";
import Deposit from "./models/deposit";
import Transfer from "./models/transfer";
import User from "./models/user";
import Withdrawal from "./models/withdrawal";

const AppDataSource = new DataSource({
    type: "mysql",
    username: "root",
    password: appconfig.get("DB_PASSWORD"),
    database: "bnmo_test",
    entities: [User, Deposit, Withdrawal, Transfer],
});

export default AppDataSource;
