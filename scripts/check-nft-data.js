const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function checkNFTData() {
    console.log('📊 Verificando dados do NFT...\n');
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    // Tentar ler endereço do arquivo
    let nftAddress;
    try {
        const savedAddress = fs.readFileSync('nft-0-address.txt', 'utf8').trim();
        nftAddress = Address.parse(savedAddress);
        console.log('📍 NFT Address:', nftAddress.toString());
    } catch {
        console.log('⚠️ Execute get-nft-address.js primeiro!');
        return;
    }
    
    try {
        // Verificar se contrato existe
        const state = await client.getContractState(nftAddress);
        console.log('📦 Estado do NFT:', state.state);
        
        if (state.state !== 'active') {
            console.log('❌ NFT ainda não foi deployed!');
            console.log('💡 O mint pode não ter criado o NFT item ainda');
            return;
        }
        
        // Tentar chamar get_nft_data
        const result = await client.runMethod(nftAddress, 'get_nft_data');
        
        console.log('\n📋 Dados do NFT:');
        console.log('-------------------');
        
        // Ler stack retornado
        const initialized = result.stack.readBoolean();
        const index = result.stack.readNumber();
        const collection = result.stack.readAddress();
        const owner = result.stack.readAddress();
        const content = result.stack.readCell();
        
        console.log('✅ Inicializado:', initialized);
        console.log('🔢 Index:', index);
        console.log('📦 Collection:', collection.toString());
        console.log('👤 Owner:', owner.toString());
        console.log('📄 Content:', content ? 'Presente' : 'Vazio');
        
    } catch (error) {
        console.error('❌ Erro ao ler dados:', error.message);
        console.log('\n💡 Possíveis problemas:');
        console.log('1. NFT não foi criado pelo mint');
        console.log('2. Contrato não implementa get_nft_data');
        console.log('3. Estrutura de dados diferente');
    }
}

checkNFTData().catch(console.error);