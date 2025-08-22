const { toNano } = require('@ton/core');
const { compile, NetworkProvider } = require('@ton/blueprint');

async function run(provider) {
    const collection = provider.open(
        await compile('Collection')
    );
    await collection.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(collection.address);
    console.log('✅ Collection deployed:', collection.address);
}

module.exports = { run };