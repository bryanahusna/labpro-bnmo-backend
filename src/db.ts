import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import appconfig from "./appconfig";
import Deposit from "./models/db/deposit";
import Transaction from "./models/db/transaction";
import Transfer from "./models/db/transfer";
import User from "./models/db/user";
import Withdrawal from "./models/db/withdrawal";

const datasourceOptions: DataSourceOptions = {
    type: "mysql",
    username: appconfig.get("DB_USERNAME") || "root",
    password: appconfig.get("DB_PASSWORD"),
    database: appconfig.get("DB_DATABASE"),
    entities: [User, Transaction, Deposit, Withdrawal, Transfer],
    timezone: "Z"
};

const AppDataSource = new DataSource(datasourceOptions);

export default AppDataSource;
export {datasourceOptions};
