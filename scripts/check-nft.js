const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
require('dotenv').config();

async function checkNFT() {
    console.log('🔍 Verificando NFTs...\n');
    
    // Cliente com API KEY
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    // Endereço da Collection
    const collectionAddress = Address.parse('EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF');
    
    try {
        // Verificar estado da Collection
        const state = await client.getContractState(collectionAddress);
        console.log('📦 Collection Status:', state.state);
        
        // Buscar transações recentes
        const transactions = await client.getTransactions(collectionAddress, {
            limit: 10
        });
        
        console.log('\n📜 Últimas transações:');
        console.log('-------------------');
        
        let mintCount = 0;
        for (const tx of transactions) {
            const inMsg = tx.inMessage;
            if (inMsg && inMsg.info.type === 'internal') {
                const value = Number(inMsg.info.value.coins) / 1e9;
                const time = new Date(tx.time * 1000).toLocaleString();
                
                // Verificar se é mint (valor ~0.05 TON)
                if (value >= 0.04 && value <= 0.06) {
                    mintCount++;
                    console.log(`✅ Mint #${mintCount - 1} - ${time} - ${value} TON`);
                }
            }
        }
        
        if (mintCount > 0) {
            console.log('\n🎨 NFTs mintados:', mintCount);
            console.log('✅ Seu NFT #0 foi criado com sucesso!');
        } else {
            console.log('\n⏳ Nenhum mint detectado ainda.');
            console.log('💡 Aguarde mais alguns segundos ou execute mint-nft.js');
        }
        
        console.log('\n🔗 Ver detalhes completos:');
        console.log('https://testnet.tonscan.org/address/' + collectionAddress.toString());
        
    } catch (error) {
        console.error('❌ Erro ao verificar:', error.message);
    }
}

checkNFT().catch(console.error);