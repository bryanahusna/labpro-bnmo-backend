import { DataSource, DataSourceOptions } from "typeorm";
import { datasourceOptions } from "./db";

export default async function synchronizedb(){
    const options: DataSourceOptions = { ...datasourceOptions, synchronize: true };
    const AppDataSource = new DataSource(options);
    await AppDataSource.initialize();
    console.log('Synchronization succesful');
    await AppDataSource.destroy();
}

synchronizedb();
