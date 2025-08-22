const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
require('dotenv').config();

async function getNFTAddress() {
    console.log('🔍 Buscando endereço do NFT #0...\n');
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    const collectionAddress = Address.parse('EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF');
    
    try {
        // Chamar get_nft_address_by_index(0)
        const result = await client.runMethod(collectionAddress, 'get_nft_address_by_index', [
            { type: 'int', value: BigInt(0) }
        ]);
        
        const nftAddress = result.stack.readAddress();
        
        console.log('✅ NFT #0 encontrado!');
        console.log('📍 Endereço:', nftAddress.toString());
        console.log('\n🔗 Ver no explorer:');
        console.log('https://testnet.tonscan.org/address/' + nftAddress.toString());
        
        // Salvar para uso posterior
        const fs = require('fs');
        fs.writeFileSync('nft-0-address.txt', nftAddress.toString());
        console.log('\n💾 Endereço salvo em nft-0-address.txt');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('💡 O contrato pode não implementar get_nft_address_by_index');
    }
}

getNFTAddress().catch(console.error);