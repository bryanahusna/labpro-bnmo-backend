import fs from 'fs';

interface CacheEntry {
    expired?: Date
};

class RateToCacheEntry implements CacheEntry {
    rate!: number;
    expired?: Date;

    constructor(rate: number, expired?: Date){
        this.rate = rate;
        if(expired){
            this.expired = expired;
        }
    }
}

class RateToCache {
    entries: Map<string, RateToCacheEntry>;

    constructor(){
        if (fs.existsSync('./cache-toidr.json')) {
            const cacheTxt: any = fs.readFileSync('./cache-toidr.json');
            const cacheJson = JSON.parse(cacheTxt);
            
            this.entries = new Map(Object.entries(cacheJson));
        } else{
            this.entries = new Map<string, RateToCacheEntry>();
        }
    }

    get(key: string){
        let entry = this.entries.get(key);
        if(entry){
            if(entry.expired && entry.expired.getTime() <= (new Date).getTime()){
                this.entries.delete(key);
                entry = undefined;
            }
        }
        return entry;
    }
    save(key: string, value: RateToCacheEntry){
        this.entries.set(key, value);
        const json = Object.fromEntries(this.entries);

        fs.writeFileSync('./cache-toidr.json', JSON.stringify(json));
    }
}

const ratetoidrcache = new RateToCache();


export { ratetoidrcache, RateToCacheEntry };
