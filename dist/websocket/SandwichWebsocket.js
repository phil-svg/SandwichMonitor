const testSandwich = {
    frontrun: {
        tx_id: 101529,
        pool_id: 97,
        event_id: 141870,
        tx_hash: "0xffc5a6ec8c2a4922746072d631a047d561c1c466b0d7ba3449cf1cdf31cbf29d",
        block_number: 17627653,
        block_unixtime: "1688559767",
        transaction_type: "swap",
        called_contract_by_user: "0x387d058D208E1b49bD192b0a14C4a75f171f0172",
        trader: "0x387d058D208E1b49bD192b0a14C4a75f171f0172",
        tx_position: 5,
        coins_leaving_wallet: [
            {
                coin_id: 32,
                amount: "10000.000000000000000",
                name: "USDC",
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 368,
                amount: "68460.635722000000000",
                name: "UST",
                address: "0xa693B19d2931d498c5B318dF961919BB4aee87a5",
            },
        ],
    },
    center: [
        {
            tx_id: 101532,
            pool_id: 97,
            event_id: 141871,
            tx_hash: "0x8beffbbe2a74d2e9b16c9fa81ed5190ed8db99e670d65316ace981c4cb876b0f",
            block_number: 17627653,
            block_unixtime: "1688559767",
            transaction_type: "swap",
            called_contract_by_user: "0xA2F987A546D4CD1c607Ee8141276876C26b72Bdf",
            trader: "0xE3c8A4De3b8A484ff890a38d6D7B5D278d697Fb7",
            tx_position: 6,
            coins_leaving_wallet: [
                {
                    coin_id: 32,
                    amount: "542.114168000000000",
                    name: "USDC",
                    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                },
            ],
            coins_entering_wallet: [
                {
                    coin_id: 368,
                    amount: "797.281721000000000",
                    name: "UST",
                    address: "0xa693B19d2931d498c5B318dF961919BB4aee87a5",
                },
            ],
        },
    ],
    backrun: {
        tx_id: 101528,
        pool_id: 97,
        event_id: 141872,
        tx_hash: "0x337de01c91940e6342ab25c542e9bda99cd8a8f93f9ddaed38786dc3c193a818",
        block_number: 17627653,
        block_unixtime: "1688559767",
        transaction_type: "swap",
        called_contract_by_user: "0x387d058D208E1b49bD192b0a14C4a75f171f0172",
        trader: "0x387d058D208E1b49bD192b0a14C4a75f171f0172",
        tx_position: 7,
        coins_leaving_wallet: [
            {
                coin_id: 368,
                amount: "68460.635722000000000",
                name: "UST",
                address: "0xa693B19d2931d498c5B318dF961919BB4aee87a5",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 32,
                amount: "10525.158118000000000",
                name: "USDC",
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            },
        ],
    },
    user_losses_details: [
        {
            unit: "UST",
            amount: 29756.694304,
            lossInPercentage: 97.39057947696351,
        },
    ],
    label: "Anchor Protocol: AnchorVault",
    poolAddress: "0xCEAF7747579696A2F0bb206a14210e3c9e6fB269",
    poolName: "wormhole v2 UST-3Pool",
};
export async function connectToWebsocket() {
    const sandwich = testSandwich;
    const message = await buildSandwichMessage(sandwich);
}
//# sourceMappingURL=SandwichWebsocket.js.map