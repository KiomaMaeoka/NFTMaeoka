const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, beginCell, Address, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function mintNFT() {
    console.log('🎨 Mintando NFT...\n');
    
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
    
    // Endereço da Collection
    const collectionAddress = Address.parse('EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF');
    
    console.log('💰 Wallet:', wallet.address.toString());
    console.log('📦 Collection:', collectionAddress.toString());
    console.log('\n⏳ Enviando mint...\n');
    
    // Criar mensagem de mint (op=1)
    const mintMessage = beginCell()
        .storeUint(1, 32) // op = 1 (mint)
        .endCell();
    
    // Enviar transação
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: 3,
        messages: [internal({
            to: collectionAddress,
            value: toNano('0.05'),
            body: mintMessage
        })]
    });
    
    console.log('✅ Mint enviado com sucesso!');
    console.log('🎨 NFT #0 será mintado para:', wallet.address.toString());
    console.log('\n⏰ Aguarde ~30 segundos para confirmação');
    console.log('🔗 Veja em: https://testnet.tonscan.org/address/' + collectionAddress.toString());
}

mintNFT().catch(console.error);