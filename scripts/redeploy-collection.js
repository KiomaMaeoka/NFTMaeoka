const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, contractAddress, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function redeployCollection() {
    console.log('🔄 Redeployando Collection com métodos completos...\n');
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    const mnemonic = 'mushroom fix fetch pottery job miss width save situate real layer rather ugly victory old advance real truth draft lend flower marriage venture wet';
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    const walletContract = client.open(wallet);
    
    // Verificar se existe o arquivo compilado
    if (!fs.existsSync('build/Collection.compiled.json')) {
        console.log('❌ Arquivo compilado não encontrado!');
        console.log('📦 Execute primeiro: npm run build');
        return;
    }
    
    // Carregar novo código
    const compiled = JSON.parse(fs.readFileSync('build/Collection.compiled.json', 'utf8'));
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Collection metadata simples
    const metadata = beginCell()
        .storeUint(0, 8)
        .storeStringTail('Maeoka Collection')
    .endCell();
    
    // Dados iniciais simples
    const data = beginCell()
        .storeUint(0, 32) // next_item_index
        .storeAddress(wallet.address) // owner
    .endCell();
    
    const stateInit = { code, data };
    const newCollectionAddress = contractAddress(0, stateInit);
    
    console.log('📍 Nova Collection será em:', newCollectionAddress.toString());
    
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: 3,
        messages: [internal({
            to: newCollectionAddress,
            value: toNano('0.05'),
            init: stateInit,
            body: beginCell().endCell()
        })]
    });
    
    console.log('✅ Nova collection deployed!');
    console.log('📋 Atualize collection-address.txt com:', newCollectionAddress.toString());
    
    fs.writeFileSync('new-collection-address.txt', newCollectionAddress.toString());
    console.log('💾 Novo endereço salvo em new-collection-address.txt');
}

redeployCollection().catch(console.error);