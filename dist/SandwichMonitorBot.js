import { EventEmitter } from "events";
import { buildSandwichMessage, telegramBotMain } from "./utils/telegram/TelegramBot.js";
import { connectToWebsocket } from "./utils/websocket/SandwichWebsocket.js";
import { priceTransaction } from "./txValue/PriceTransaction.js";
console.clear();
// const ENV = "prod";
const ENV = "test";
const eventEmitter = new EventEmitter();
async function main() {
    await telegramBotMain(ENV, eventEmitter);
    await connectToWebsocket(eventEmitter);
}
await main();
let enrichedSandwich = {
    frontrun: {
        tx_id: 101421,
        pool_id: 28,
        event_id: 142867,
        tx_hash: "0x54082d12f8ab922607c42433ecff63dfb9f6c11a92e7b0160616bd8b917e20e5",
        block_number: 17629377,
        block_unixtime: "1688580647",
        transaction_type: "swap",
        called_contract_by_user: "0xE8c060F8052E07423f71D445277c61AC5138A2e5",
        trader: "0xE8c060F8052E07423f71D445277c61AC5138A2e5",
        tx_position: 4,
        coins_leaving_wallet: [
            {
                coin_id: 28,
                amount: "718.733090248213600",
                name: "3Crv",
                address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 259,
                amount: "152984.553881940930000",
                name: "UST",
                address: "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
            },
        ],
    },
    center: [
        {
            tx_id: 101416,
            pool_id: 28,
            event_id: 142868,
            tx_hash: "0x67e14a5ccde90aabc5f65349c325c7c61d76be79c3b190073f5ec8b421e1723a",
            block_number: 17629377,
            block_unixtime: "1688580647",
            transaction_type: "swap",
            called_contract_by_user: "0xeCb456EA5365865EbAb8a2661B0c503410e9B347",
            trader: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
            tx_position: 5,
            coins_leaving_wallet: [
                {
                    coin_id: 28,
                    amount: "9.656041053186470",
                    name: "3Crv",
                    address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
                },
            ],
            coins_entering_wallet: [
                {
                    coin_id: 259,
                    amount: "6099.199873959161000",
                    name: "UST",
                    address: "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
                },
            ],
        },
    ],
    backrun: {
        tx_id: 101423,
        pool_id: 28,
        event_id: 142869,
        tx_hash: "0xbdab0526dd736cd1037b1a5bac66ae91ec8b462a04f6070835601ae7f34fca9e",
        block_number: 17629377,
        block_unixtime: "1688580647",
        transaction_type: "swap",
        called_contract_by_user: "0xE8c060F8052E07423f71D445277c61AC5138A2e5",
        trader: "0xE8c060F8052E07423f71D445277c61AC5138A2e5",
        tx_position: 6,
        coins_leaving_wallet: [
            {
                coin_id: 259,
                amount: "158187.842888238640000",
                name: "UST",
                address: "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 28,
                amount: "718.733090248213600",
                name: "3Crv",
                address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
            },
        ],
    },
    user_losses_details: [
        {
            unit: "3Crv",
            amount: 63.505298732480725,
            lossInPercentage: 86.80171647830026,
        },
    ],
    label: "Curve.fi: Pool Owner",
    poolName: "UST MetaPool",
    poolAddress: "0x890f4e345B1dAED0367A877a1612f86A1f86985f",
};
const value = await priceTransaction(enrichedSandwich.center[0]);
console.log(value);
const message = await buildSandwichMessage(enrichedSandwich, value);
eventEmitter.emit("newMessage", message);
//# sourceMappingURL=SandwichMonitorBot.js.map