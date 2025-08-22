const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, Address, contractAddress, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function deployWithApiKey() {
    console.log('🚀 Deploy com API Key...\n');
    
    // Cliente com API KEY
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    // Criar wallet
    const mnemonic = 'mushroom fix fetch pottery job miss width save situate real layer rather ugly victory old advance real truth draft lend flower marriage venture wet';
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ 
        publicKey: key.publicKey, 
        workchain: 0 
    });
    
    const walletContract = client.open(wallet);
    
    console.log('💰 Wallet:', wallet.address.toString());
    
    // Verificar saldo
    const balance = await walletContract.getBalance();
    console.log('💎 Saldo:', Number(balance) / 1e9, 'TON\n');
    
    // Carregar contrato compilado
    const compiled = JSON.parse(
        fs.readFileSync('build/Collection.compiled.json', 'utf8')
    );
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Dados iniciais
    const data = beginCell()
        .storeUint(0, 32) // next_item_index
        .storeAddress(wallet.address) // owner
        .endCell();
    
    // Calcular endereço
    const stateInit = { code, data };
    const collectionAddress = contractAddress(0, stateInit);
    
    console.log('📦 Collection será deployed em:');
    console.log(collectionAddress.toString());
    console.log('\n⏳ Enviando transação...\n');
    
    // Enviar deploy
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: 3,
        messages: [internal({
            to: collectionAddress,
            value: toNano('0.05'),
            init: stateInit,
            body: beginCell().endCell()
        })]
    });
    
    console.log('✅ Deploy enviado com sucesso!');
    console.log('\n🔗 Veja em:');
    console.log('https://testnet.tonscan.org/address/' + collectionAddress.toString());
    
    // Aguardar confirmação
    console.log('\n⏰ Aguardando confirmação...');
    let deployed = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const state = await client.getContractState(collectionAddress);
        if (state.state === 'active') {
            deployed = true;
            break;
        }
        process.stdout.write('.');
    }
    
    if (deployed) {
        console.log('\n\n🎉 CONTRATO DEPLOYED COM SUCESSO!');
        console.log('📍 Endereço final:', collectionAddress.toString());
    } else {
        console.log('\n\n⏳ Deploy enviado, aguarde mais alguns segundos para ativação.');
    }
}

deployWithApiKey().catch(console.error);