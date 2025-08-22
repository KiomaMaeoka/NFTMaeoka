const { toNano, Address, Cell } = require('@ton/core');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { WalletContractV4, TonClient } = require('@ton/ton');
const { Collection } = require('../wrappers/Collection');
const fs = require('fs');
require('dotenv').config();

async function run() {
    // Verificar se .env existe
    if (!process.env.MNEMONIC) {
        console.error('❌ Por favor, crie um arquivo .env com sua MNEMONIC');
        console.error('   Copie .env.example para .env e adicione sua mnemonic de 24 palavras');
        return;
    }
    
    // Conectar cliente
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
    });
    
    // Criar wallet
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    if (!await client.isContractDeployed(wallet.address)) {
        console.log('Wallet não está deployada:', wallet.address);
        return;
    }
    
    const walletContract = client.open(wallet);
    const sender = walletContract.sender(key.secretKey);
    
    // Carregar contrato compilado
    const compiledContract = JSON.parse(
        fs.readFileSync('build/Collection.compiled.json', 'utf8')
    );
    const code = Cell.fromBoc(Buffer.from(compiledContract.hex, 'hex'))[0];
    
    // Deploy collection
    const collection = Collection.createFromConfig(
        { owner: wallet.address },
        code
    );
    
    const collectionContract = client.open(collection);
    
    console.log('Deploying to:', collection.address);
    
    await collectionContract.sendDeploy(sender, toNano('0.05'));
    
    console.log('✅ Deploy enviado! Aguardando confirmação...');
    
    // Aguardar deploy
    let deployed = false;
    while (!deployed) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        deployed = await client.isContractDeployed(collection.address);
        if (!deployed) {
            console.log('Aguardando deploy...');
        }
    }
    
    console.log('✅ Collection deployed:', collection.address);
}

module.exports = { run };