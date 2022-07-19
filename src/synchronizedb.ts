import { DataSource } from "typeorm";
import appconfig from "./appconfig";
import Deposit from "./models/db/deposit";
import Transfer from "./models/db/transfer";
import User from "./models/db/user";
import Withdrawal from "./models/db/withdrawal";

export default async function synchronizedb(){
    const AppDataSource = new DataSource({
        type: "mysql",
        username: "root",
        password: appconfig.get("DB_PASSWORD"),
        database: "bnmo_test",
        entities: [User, Deposit, Withdrawal, Transfer],
        synchronize: true
    });
    await AppDataSource.initialize();
    console.log('Synchronization succesful');   
}

synchronizedb();
