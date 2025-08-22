const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
const fs = require('fs');
require('dotenv').config();

async function findNFTsByTransactions() {
    console.log('🔍 Buscando NFTs através das transações...\n');
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    const collection = Address.parse('EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF');
    
    try {
        // Buscar todas as transações da collection
        const transactions = await client.getTransactions(collection, {
            limit: 50
        });
        
        console.log(`📜 Analisando ${transactions.length} transações...\n`);
        
        const nftAddresses = [];
        let mintCount = 0;
        
        for (const tx of transactions) {
            // Verificar mensagens de saída (NFTs criados)
            if (tx.outMessages && tx.outMessages.size > 0) {
                tx.outMessages.forEach((msg) => {
                    if (msg.info && msg.info.dest) {
                        const destAddress = msg.info.dest.toString();
                        
                        // Verificar se é criação de contrato (init presente)
                        if (msg.init) {
                            mintCount++;
                            nftAddresses.push(destAddress);
                            console.log(`✅ NFT #${mintCount - 1} encontrado!`);
                            console.log(`   Endereço: ${destAddress}`);
                            console.log(`   Link: https://testnet.tonscan.org/address/${destAddress}\n`);
                        }
                    }
                });
            }
        }
        
        if (nftAddresses.length > 0) {
            console.log(`\n🎨 Total de NFTs encontrados: ${nftAddresses.length}`);
            
            // Salvar primeiro NFT
            if (nftAddresses[0]) {
                fs.writeFileSync('nft-0-address.txt', nftAddresses[0]);
                console.log(`\n💾 NFT #0 salvo em nft-0-address.txt`);
                console.log(`📍 Endereço: ${nftAddresses[0]}`);
            }
            
            // Salvar todos os NFTs
            fs.writeFileSync('all-nfts.json', JSON.stringify(nftAddresses, null, 2));
            console.log(`💾 Todos os NFTs salvos em all-nfts.json`);
            
        } else {
            console.log('❌ Nenhum NFT encontrado nas transações');
            console.log('\n💡 Possíveis razões:');
            console.log('1. O mint não criou contratos filhos');
            console.log('2. A collection não está configurada para criar NFT items');
            console.log('3. Precisamos implementar a lógica de criação de NFT items');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

findNFTsByTransactions().catch(console.error);