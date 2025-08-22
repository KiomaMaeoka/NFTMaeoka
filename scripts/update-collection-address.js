const fs = require('fs');

const NEW_COLLECTION = 'EQCUFX7O4RBmw_RGpaUCt_MJ0DpGkBRI3PyWevnlfff-a3f0';

// Atualizar collection-address.txt
fs.writeFileSync('collection-address.txt', NEW_COLLECTION);
console.log('✅ collection-address.txt atualizado');

// Scripts para atualizar
const scripts = [
    'scripts/mint-nft.js',
    'scripts/get-nft-0-address.js',
    'scripts/check-nft.js',
    'scripts/mint-with-metadata.js'
];

scripts.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Substituir endereço antigo
        content = content.replace(
            'EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF',
            NEW_COLLECTION
        );
        fs.writeFileSync(file, content);
        console.log(`✅ ${file} atualizado`);
    }
});

console.log('\n📍 Nova collection:', NEW_COLLECTION);
console.log('🎯 Agora execute:');
console.log('1. node scripts/mint-nft.js - Para mintar NFT');
console.log('2. node scripts/get-nft-0-address.js - Para buscar endereço');