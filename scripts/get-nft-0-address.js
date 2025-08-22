const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
require('dotenv').config();

async function getNFTAddress() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    const collection = Address.parse('EQCUFX7O4RBmw_RGpaUCt_MJ0DpGkBRI3PyWevnlfff-a3f0');
    
    try {
        // Chamar get_nft_address_by_index
        const result = await client.runMethod(collection, 'get_nft_address_by_index', [
            { type: 'int', value: 0n }
        ]);
        
        const nftAddress = result.stack.readAddress();
        console.log('NFT #0 Address:', nftAddress.toString());
        console.log('Ver em:', `https://testnet.tonscan.org/address/${nftAddress.toString()}`);
        
        // Salvar endereço
        const fs = require('fs');
        fs.writeFileSync('nft-0-address.txt', nftAddress.toString());
        console.log('Salvo em: nft-0-address.txt');
        
    } catch (error) {
        console.error('Erro:', error.message);
        console.log('Collection pode não ter get_nft_address_by_index implementado');
    }
}

getNFTAddress().catch(console.error);