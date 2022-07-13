import { DataSource } from "typeorm";
import User from "./models/user";

const AppDataSource = new DataSource({
    type: "mysql",
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "bnmo_test",
    entities: [User],
    synchronize: true
});

AppDataSource.initialize();

export default AppDataSource;
