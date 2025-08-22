const { Config } = require('@ton/blueprint');

const config = {
    network: {
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        type: 'testnet',
    },
};

module.exports = { config };