import { Config } from '@ton/blueprint';
import * as dotenv from 'dotenv';
dotenv.config();

export const config: Config = {
    network: {
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        type: 'testnet',
        apiKey: process.env.TONCENTER_API_KEY,
    },
};