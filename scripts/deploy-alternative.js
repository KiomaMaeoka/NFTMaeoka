const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, Address } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function deployAlternative() {
    console.log('🚀 Deploy com endpoint alternativo...\n');
    
    // Tentar múltiplos endpoints
    const endpoints = [
        { url: 'https://testnet.tonhubapi.com/jsonRPC', name: 'TonHub' },
        { url: 'https://scalable-api.tonwhales.com/jsonRPC', name: 'Tonwhales' },
        { url: 'https://testnet.toncenter.com/api/v2/jsonRPC', name: 'TON Center' }
    ];
    
    let client = null;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Tentando ${endpoint.name}...`);
            const testClient = new TonClient({ 
                endpoint: endpoint.url,
                apiKey: undefined 
            });
            
            // Testar conexão
            await testClient.getBalance(Address.parse('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t'));
            client = testClient;
            console.log(`✅ Conectado ao ${endpoint.name}!\n`);
            break;
        } catch (e) {
            console.log(`❌ ${endpoint.name} falhou\n`);
        }
    }
    
    if (!client) {
        console.log('😔 Nenhum endpoint disponível. Deploy manual necessário:');
        console.log('\n📋 INSTRUÇÕES PARA DEPLOY MANUAL:');
        console.log('1. Abra Tonkeeper/Tonhub no celular');
        console.log('2. Mude para Testnet nas configurações');
        console.log('3. Use https://minter.ton.org para deploy');
        console.log('4. Cole o código do contrato de build/Collection.compiled.json');
        return;
    }
    
    // Setup wallet
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    const walletContract = client.open(wallet);
    
    // Preparar contrato
    const compiled = JSON.parse(fs.readFileSync('build/Collection.compiled.json', 'utf8'));
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    const data = beginCell()
        .storeUint(0, 32)
        .storeAddress(wallet.address)
        .endCell();
    
    // Deploy
    console.log('📦 Enviando deploy...');
    const seqno = await walletContract.getSeqno();
    
    const { contractAddress } = require('@ton/core');
    const collectionAddress = contractAddress(0, { code, data });
    
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [{
            to: collectionAddress,
            value: toNano('0.05'),
            init: { code, data },
            body: beginCell().endCell()
        }]
    });
    
    console.log('✅ Deploy enviado!');
    console.log('📍 Endereço:', collectionAddress.toString());
}

deployAlternative().catch(console.error);