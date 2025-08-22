const { toNano, Cell, Address } = require('@ton/core');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { WalletContractV4, TonClient } = require('@ton/ton');
require('dotenv').config();

async function deploy() {
    console.log('🚀 Iniciando deploy...');
    
    // Tentar diferentes endpoints
    const endpoints = [
        'https://testnet.toncenter.com/api/v2/jsonRPC',
        'https://testnet.tonhubapi.com/jsonRPC',
    ];
    
    let client;
    for (const endpoint of endpoints) {
        try {
            console.log(`Tentando endpoint: ${endpoint}`);
            client = new TonClient({ endpoint });
            await client.getBalance(Address.parse('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t'));
            console.log('✅ Endpoint conectado!');
            break;
        } catch (e) {
            console.log('❌ Falhou, tentando próximo...');
        }
    }
    
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    console.log('💰 Wallet:', wallet.address.toString());
    const balance = await client.getBalance(wallet.address);
    console.log('💎 Saldo:', balance / 1000000000n, 'TON');
    
    if (balance === 0n) {
        console.log('⚠️ Wallet sem saldo! Pegue TON de teste em:');
        console.log('https://testnet.tonhub.com/');
        return;
    }
    
    console.log('✅ Pronto para deploy! Use: npm run deploy');
}

deploy().catch(console.error);