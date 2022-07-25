export default class Conversion {
    date!: Date;
    info!: {
        rate: number;
        timestamp: EpochTimeStamp
    };
    query!: {
        amount: number;
        from: string;
        to: string;
    };
    result!: number;
    success!: boolean;

    error?: {
        code: string;
        message: string;
    }
}
