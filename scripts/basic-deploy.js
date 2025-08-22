const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, contractAddress } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function deploy() {
    console.log('🚀 Deploy básico da Collection NFT...');
    
    // Cliente com timeout maior
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        timeout: 60000
    });
    
    // Wallet
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    console.log('💰 Wallet:', wallet.address.toString());
    
    // Código do contrato compilado
    const compiledContract = JSON.parse(
        fs.readFileSync('build/Collection.compiled.json', 'utf8')
    );
    const code = Cell.fromBoc(Buffer.from(compiledContract.hex, 'hex'))[0];
    
    // Data inicial da collection
    const data = beginCell()
        .storeUint(0, 32) // next_item_index = 0
        .storeAddress(wallet.address) // owner address
        .endCell();
    
    // Calcular endereço
    const init = { code, data };
    const collectionAddress = contractAddress(0, init);
    
    console.log('📦 Collection address:', collectionAddress.toString());
    console.log('');
    console.log('✅ Configuração pronta!');
    console.log('');
    console.log('Para fazer o deploy:');
    console.log('1. Vá para https://minter.ton.org/');
    console.log('2. Conecte sua wallet com a mnemonic');
    console.log('3. Ou aguarde alguns minutos e tente npm run deploy novamente');
    console.log('');
    console.log('📋 Dados para deploy manual:');
    console.log('- Code (hex):', compiledContract.hex);
    console.log('- Data (base64):', data.toBoc().toString('base64'));
    console.log('- Value: 0.05 TON');
    
}

deploy().catch(console.error);