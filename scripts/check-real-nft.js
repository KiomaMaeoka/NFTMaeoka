const { TonClient } = require('@ton/ton');
const { Address } = require('@ton/core');
require('dotenv').config();

async function checkRealNFT() {
    console.log('🔍 Verificando NFT real...\n');
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: 'bcaaad170d17ab49f90d2cc61ba2ba551e49c008a860fa0453e3c53b809540d7'
    });
    
    const NEW_COLLECTION = 'EQCUFX7O4RBmw_RGpaUCt_MJ0DpGkBRI3PyWevnlfff-a3f0';
    const collection = Address.parse(NEW_COLLECTION);
    
    try {
        // 1. Verificar estado da collection
        const collectionState = await client.getContractState(collection);
        console.log('📦 Collection status:', collectionState.state);
        
        // 2. Buscar endereço do NFT #0
        const result = await client.runMethod(collection, 'get_nft_address_by_index', [
            { type: 'int', value: 0n }
        ]);
        
        const nftAddress = result.stack.readAddress();
        console.log('📍 NFT #0 endereço calculado:', nftAddress.toString());
        
        // 3. Verificar se o NFT foi deployado
        const nftState = await client.getContractState(nftAddress);
        console.log('🎨 NFT #0 status:', nftState.state);
        
        if (nftState.state === 'active') {
            console.log('✅ NFT FOI CRIADO COM SUCESSO!');
            
            // Tentar ler dados do NFT
            try {
                const nftData = await client.runMethod(nftAddress, 'get_nft_data');
                console.log('📊 NFT tem método get_nft_data');
            } catch {
                console.log('⚠️ NFT não tem get_nft_data implementado');
            }
        } else {
            console.log('❌ NFT ainda não foi deployado');
            console.log('\n💡 Problemas possíveis:');
            console.log('1. Collection não tem código do NFT item');
            console.log('2. Mint não enviou gas suficiente');
            console.log('3. Lógica de deploy_nft_item precisa correção');
            
            // Buscar transações para debug
            const txs = await client.getTransactions(collection, { limit: 10 });
            console.log(`\n📜 ${txs.length} transações na collection`);
            
            let hasOutMessages = false;
            txs.forEach(tx => {
                if (tx.outMessages && tx.outMessages.size > 0) {
                    hasOutMessages = true;
                }
            });
            
            if (hasOutMessages) {
                console.log('✅ Collection enviou mensagens (tentou criar NFTs)');
            } else {
                console.log('❌ Collection não enviou mensagens de criação');
            }
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

checkRealNFT().catch(console.error);