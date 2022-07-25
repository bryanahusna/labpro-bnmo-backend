import fetch from 'node-fetch';

import appconfig from "../../appconfig";
import Conversion from "./Conversion";
import { RateToCacheEntry, ratetoidrcache } from '../../cache';

export default async function getRateToIDR(from: string){
    const requestOptions = {
        method: "GET",
        headers: {
            "apikey": appconfig.get("CURRENCY_APIKEY") || ''
        }
    }
    const endpoint = `https://api.apilayer.com/exchangerates_data/convert?to=IDR&from=${from}&amount=1`;

    const cachevalue = ratetoidrcache.get(from);
    if(cachevalue) return cachevalue.rate;

    const res = await fetch(endpoint, requestOptions);
    const resTxt = await res.text();
    const result = JSON.parse(resTxt) as Conversion;
    if(result.error) throw new Error(result.error.message);
    
    ratetoidrcache.save(from, new RateToCacheEntry(result.info.rate));
    return result.info.rate;
}
