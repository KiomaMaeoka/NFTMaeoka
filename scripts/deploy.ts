import { toNano } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const collection = provider.open(
        await compile('collection')
    );
    await collection.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(collection.address);
    console.log('✅ Collection deployed:', collection.address);
}