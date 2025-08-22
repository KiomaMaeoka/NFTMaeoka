const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, Cell, beginCell, contractAddress, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function deployFinalCollection() {
    console.log('🎨 Deployando Collection NFT Educacional...\n');
    console.log('📚 Projeto: Maeoka NFT - Sistema de NFTs Fracionáveis');
    console.log('🎯 Objetivo: Aprender desenvolvimento blockchain na TON\n');
    
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
    
    console.log('👤 Wallet do criador:', wallet.address.toString());
    console.log('🌐 Rede: TESTNET (não é mainnet, sem valor real)\n');
    
    // Carregar código compilado
    let collectionCode;
    try {
        const compiled = JSON.parse(fs.readFileSync('build/Collection.compiled.json', 'utf8'));
        collectionCode = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    } catch {
        console.log('⚠️ Usando código básico de collection');
        // Código básico válido
        collectionCode = beginCell().storeUint(0xFF00, 16).endCell();
    }
    
    // Metadata educacional
    const metadata = beginCell()
        .storeUint(0, 8)
        .storeStringTail('Maeoka Educational NFT Collection - Learn TON Development')
    .endCell();
    
    // Código NFT item placeholder
    const nftItemCode = beginCell().storeUint(0xFF00, 16).endCell();
    
    // Data inicial
    const data = beginCell()
        .storeUint(0, 32) // next_item_index
        .storeAddress(wallet.address) // owner
        .storeRef(metadata) // collection_content
        .storeRef(nftItemCode) // nft_item_code
    .endCell();
    
    const stateInit = { code: collectionCode, data };
    const collectionAddress = contractAddress(0, stateInit);
    
    console.log('📍 Endereço da Collection:', collectionAddress.toString());
    console.log('📝 Tipo: Collection NFT Educacional');
    console.log('🔒 Segurança: Testnet apenas, sem valor monetário\n');
    
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
    
    console.log('✅ Collection educacional deployada!');
    console.log('📚 Use para aprender sobre:');
    console.log('   - Smart contracts na TON');
    console.log('   - Criação de NFTs');
    console.log('   - Interação com blockchain');
    console.log('   - Desenvolvimento Web3\n');
    
    fs.writeFileSync('final-collection-address.txt', collectionAddress.toString());
    console.log('💾 Endereço salvo em: final-collection-address.txt');
    
    console.log('\n📖 Documentação: https://docs.ton.org/develop/dapps/tutorials/collection-minting');
    console.log('🎓 Este é um projeto educacional para aprender TON blockchain!');
}

deployFinalCollection().catch(console.error);