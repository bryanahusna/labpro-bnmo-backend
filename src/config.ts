import fs from 'fs';

// Config priority: environment variables first, then config.json

const config = new Map();

const configTxt: any = fs.readFileSync('./src/config.json');
const configJson = JSON.parse(configTxt);

// config.json will be overwritten by process.env if same key exists
for(const property in configJson){
    config.set(property, configJson[property]);
}
for(const property in process.env){
    config.set(property, process.env[property]);
}


export default config;
