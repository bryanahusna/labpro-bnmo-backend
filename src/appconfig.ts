import fs from 'fs';

// Config priority: environment variables first, then config.json

const appconfig = new Map<string, string>();

const configTxt: any = fs.readFileSync('./src/appconfig.json');
const configJson = JSON.parse(configTxt);

// config.json will be overwritten by process.env if same key exists
for(const property in configJson){
    appconfig.set(property, configJson[property]);
}
for(const property in process.env){
    appconfig.set(property, process.env[property] || appconfig.get(property) || '');
}


export default appconfig;
