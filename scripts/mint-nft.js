const { TonClient, WalletContractV4 } = require('@ton/ton');
const { mnemonicToWalletKey } = require('@ton/crypto');
const { toNano, beginCell, Address, internal } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function mintNFT() {
    console.log('🎨 Mintando NFT com Metadados Completos...\n');
    
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
    
    // NOVA COLLECTION!
    const collectionAddress = Address.parse('EQBZBR8-vYVCTdJlQA_MfPhm9b-6lntez8Z-fQoyMAO38JMz');
    
    // Metadados completos do NFT
    const metadata = {
        name: "Maeoka Terreno #0",
        description: "Participação 10% - Terreno Curitiba",
        image: "https://raw.githubusercontent.com/ton-community/ton-docs/main/static/img/logo.svg",
        attributes: [
            { trait_type: "Percentual", value: "10%" },
            { trait_type: "Tipo", value: "Terreno" },
            { trait_type: "Local", value: "Curitiba" }
        ]
    };
    
    console.log('📦 Collection:', collectionAddress.toString());
    console.log('🏷️ NFT:', metadata.name);
    console.log('📊 Percentual:', metadata.attributes[0].value);
    console.log('🏗️ Tipo:', metadata.attributes[1].value);
    console.log('📍 Local:', metadata.attributes[2].value);
    
    // Criar content cell com metadata JSON
    const contentCell = beginCell()
        .storeUint(0x01, 8) // onchain metadata tag
        .storeStringTail(JSON.stringify(metadata))
    .endCell();
    
    // Criar mensagem de mint com metadata
    const mintMessage = beginCell()
        .storeUint(1, 32) // op = 1 (mint)
        .storeAddress(wallet.address) // owner do NFT
        .storeRef(contentCell) // metadata completo
    .endCell();
    
    console.log('\n⏳ Enviando mint com metadados...\n');
    
    // Enviar transação
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: 3,
        messages: [internal({
            to: collectionAddress,
            value: toNano('0.1'), // Gas suficiente para deploy
            body: mintMessage
        })]
    });
    
    console.log('✅ NFT mintado com metadados completos!');
    console.log('\n🎨 NFT Criado:');
    console.log('   Nome:', metadata.name);
    console.log('   Descrição:', metadata.description);
    console.log('   Imagem:', metadata.image);
    console.log('   Atributos:');
    metadata.attributes.forEach(attr => {
        console.log(`     - ${attr.trait_type}: ${attr.value}`);
    });
    
    console.log('\n💰 Representa: 10% de participação em terreno');
    console.log('📍 Localização: Curitiba, PR');
    console.log('\n⏰ Aguarde ~30 segundos para confirmação');
    console.log('🔗 Veja em: https://testnet.tonscan.org/address/' + collectionAddress.toString());
    
    // Salvar metadata
    fs.writeFileSync('last-minted-nft.json', JSON.stringify({
        collection: collectionAddress.toString(),
        metadata: metadata,
        timestamp: new Date().toISOString()
    }, null, 2));
    console.log('\n💾 Metadados salvos em: last-minted-nft.json');
}

mintNFT().catch(console.error);