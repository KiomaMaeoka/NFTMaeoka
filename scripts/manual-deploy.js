const { toNano, Cell, beginCell, Address } = require('@ton/core');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { WalletContractV4, TonClient, internal, SendMode } = require('@ton/ton');
const fs = require('fs');
require('dotenv').config();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function deploy() {
    console.log('🚀 Deploy Manual com Delays...\n');
    
    // Tentar diferentes endpoints
    const endpoints = [
        'https://testnet.toncenter.com/api/v2/jsonRPC',
        'https://testnet.tonhubapi.com/jsonRPC',
        'https://toncenter.com/api/v2/jsonRPC?testnet=true'
    ];
    
    let client;
    for (const endpoint of endpoints) {
        try {
            console.log(`🔗 Tentando: ${endpoint.split('/')[2]}`);
            client = new TonClient({
                endpoint,
                timeout: 30000
            });
            // Teste rápido
            await client.getBalance(Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'));
            console.log('✅ Conectado!\n');
            break;
        } catch (e) {
            console.log('❌ Falhou, próximo...');
            if (endpoint === endpoints[endpoints.length - 1]) {
                throw new Error('Todos os endpoints falharam');
            }
        }
    }
    
    // Criar wallet
    const key = await mnemonicToWalletKey(process.env.MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    const walletContract = client.open(wallet);
    const sender = walletContract.sender(key.secretKey);
    
    console.log('💰 Wallet:', wallet.address.toString());
    await sleep(2000); // Delay para evitar rate limit
    
    // Verificar saldo
    const balance = await walletContract.getBalance();
    console.log('💎 Saldo:', Number(balance) / 1e9, 'TON\n');
    
    if (balance === 0n) {
        console.log('⚠️ Sem saldo! Pegue em: https://testnet.tonhub.com/');
        return;
    }
    
    // Carregar contrato compilado
    const compiled = JSON.parse(
        fs.readFileSync('build/Collection.compiled.json', 'utf8')
    );
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Preparar dados iniciais
    const data = beginCell()
        .storeUint(0, 32) // next_item_index
        .storeAddress(wallet.address) // owner
        .endCell();
    
    // Calcular endereço do contrato
    const { contractAddress } = require('@ton/core');
    const collectionAddress = contractAddress(0, { code, data });
    console.log('📦 Collection será deployed em:');
    console.log(collectionAddress.toString());
    console.log('\n⏳ Enviando transação...\n');
    
    await sleep(3000); // Delay antes de enviar
    
    // Enviar deploy usando método interno
    const { internal } = require('@ton/core');
    
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: await walletContract.getSeqno(),
        messages: [
            internal({
                to: collectionAddress,
                value: toNano('0.05'),
                init: { code, data },
                body: beginCell().endCell()
            })
        ]
    });
    
    console.log('✅ Deploy enviado com sucesso!');
    console.log('🔗 Veja em: https://testnet.tonscan.org/address/' + collectionAddress.toString());
    console.log('\n⏰ Aguarde ~30 segundos para confirmação');
}

deploy().catch(e => {
    console.error('❌ Erro:', e.message);
    if (e.message.includes('429')) {
        console.log('\n💡 Tente novamente em 1 minuto');
    }
});