import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    toNano
} from '@ton/core';

export type CollectionConfig = {
    owner: Address;
};

export function collectionConfigToCell(config: CollectionConfig): Cell {
    return beginCell()
        .storeUint(0, 32) // next_item_index
        .storeAddress(config.owner)
        .endCell();
}

export class Collection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Collection(address);
    }

    static createFromConfig(config: CollectionConfig, code: Cell, workchain = 0) {
        const data = collectionConfigToCell(config);
        const init = { code, data };
        return new Collection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            itemIndex: number;
            itemOwner: Address;
            itemContent: string;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) // op: mint
                .storeUint(0, 64) // query_id
                .storeUint(opts.itemIndex, 32)
                .storeAddress(opts.itemOwner)
                .storeRef(
                    beginCell()
                        .storeStringTail(opts.itemContent)
                        .endCell()
                )
                .endCell(),
        });
    }

    async getCollectionData(provider: ContractProvider) {
        const result = await provider.get('get_collection_data', []);
        return {
            nextItemIndex: result.stack.readNumber(),
            collectionContent: result.stack.readCell(),
            ownerAddress: result.stack.readAddress(),
        };
    }
}

module.exports = { Collection, collectionConfigToCell };