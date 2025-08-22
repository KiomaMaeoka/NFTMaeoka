const { TonClient, WalletContractV4, internal } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, contractAddress } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function deploy() {
    console.log('🚀 Deploy final da Collection NFT...');
    
    // Cliente
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
    });
    
    // Wallet
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    const walletContract = client.open(wallet);
    
    console.log('💰 Wallet:', wallet.address.toString());
    
    // Código do contrato
    const compiledContract = JSON.parse(
        fs.readFileSync('build/Collection.compiled.json', 'utf8')
    );
    const code = Cell.fromBoc(Buffer.from(compiledContract.hex, 'hex'))[0];
    
    // Data inicial
    const data = beginCell()
        .storeUint(0, 32) // next_item_index = 0
        .storeAddress(wallet.address) // owner
        .endCell();
    
    // Endereço do contrato
    const init = { code, data };
    const collectionAddress = contractAddress(0, init);
    
    console.log('📦 Collection será deployada em:', collectionAddress.toString());
    
    try {
        // Enviar deploy
        await walletContract.sendTransfer({
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: collectionAddress,
                    value: toNano('0.05'),
                    init: init,
                    body: beginCell().endCell()
                })
            ]
        });
        
        console.log('✅ Deploy enviado com sucesso!');
        console.log('');
        console.log('📋 Endereço da Collection:');
        console.log(collectionAddress.toString());
        console.log('');
        console.log('🔍 Verifique no explorer:');
        console.log(`https://testnet.tonscan.org/address/${collectionAddress.toString()}`);
        console.log('');
        console.log('⏰ Aguarde 1-2 minutos para confirmação na blockchain.');
        
    } catch (error) {
        console.error('❌ Erro no deploy:', error.message);
        
        if (error.message.includes('429')) {
            console.log('⏰ Limite de requisições. Tente novamente em 1-2 minutos.');
        }
    }
}

deploy().catch(console.error);