const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, beginCell, Address, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function mintWithMetadata() {
    console.log('🎨 Mintando NFT com Metadata...\n');
    
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
    const collectionAddress = Address.parse('EQCUFX7O4RBmw_RGpaUCt_MJ0DpGkBRI3PyWevnlfff-a3f0');
    
    // Criar metadata
    const metadata = {
        name: "Maeoka NFT #0",
        description: "NFT Teste Fracionável",
        image: "https://avatars.githubusercontent.com/u/150419295" // Seu avatar GitHub
    };
    
    // Criar content cell com metadata
    const contentCell = beginCell()
        .storeUint(0x01, 8) // onchain metadata tag
        .storeStringTail(JSON.stringify(metadata))
        .endCell();
    
    // Mensagem de mint com metadata
    const mintMessage = beginCell()
        .storeUint(1, 32) // op = 1 (mint)
        .storeAddress(wallet.address) // owner
        .storeRef(contentCell) // metadata
        .endCell();
    
    console.log('📦 Collection:', collectionAddress.toString());
    console.log('📋 Metadata:', metadata.name);
    console.log('\n⏳ Enviando mint com metadata...\n');
    
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: 3,
        messages: [internal({
            to: collectionAddress,
            value: toNano('0.1'), // Mais gas para deploy do item
            body: mintMessage
        })]
    });
    
    console.log('✅ Mint com metadata enviado!');
    console.log('🎨 NFT terá:');
    console.log('  - Nome:', metadata.name);
    console.log('  - Descrição:', metadata.description);
    console.log('  - Imagem:', metadata.image);
    console.log('\n⏰ Aguarde ~30 segundos e execute get-nft-address.js');
}

mintWithMetadata().catch(console.error);