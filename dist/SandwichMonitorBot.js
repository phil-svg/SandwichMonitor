import { EventEmitter } from "events";
import { buildSandwichMessage, telegramBotMain } from "./utils/telegram/TelegramBot.js";
import { connectToWebsocket } from "./utils/websocket/SandwichWebsocket.js";
console.clear();
// const ENV = "prod";
const ENV = "test";
const eventEmitter = new EventEmitter();
async function main() {
    await telegramBotMain(ENV, eventEmitter);
    await connectToWebsocket(eventEmitter);
}
await main();
const sandwichDetails = {
    frontrun: {
        tx_id: 137993,
        pool_id: 153,
        event_id: 336504,
        tx_hash: "0x7dccd42d5a50c60ba5bc5a794589f8079eaee316b993b58c3af25cf795ddbd3f",
        block_number: 17747827,
        block_unixtime: "1690018727",
        transaction_type: "swap",
        called_contract_by_user: "0xFd0000000100069aD1670066004306009B487AD7",
        trader: "0x7E645CEC19e185FBBA266D57FC608db0c4c23b06",
        tx_position: 0,
        coins_leaving_wallet: [
            {
                coin_id: 245,
                amount: "7202.908273020616000",
                name: "CRV",
                address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 121,
                amount: "7390.402362808626000",
                name: "sdCRV",
                address: "0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5",
            },
        ],
    },
    center: [
        {
            tx_id: 137992,
            pool_id: 153,
            event_id: 336505,
            tx_hash: "0xd7674a442e4eaf7ff7be24a0015a261e53d8c749e1a97af12321b47bbb1e8576",
            block_number: 17747827,
            block_unixtime: "1690018727",
            transaction_type: "swap",
            called_contract_by_user: "0x43E54C2E7b3e294De3A155785F52AB49d87B9922",
            trader: "0xc7b9812017242cFF5f0AE71611dDfA43d4aED974",
            tx_position: 1,
            coins_leaving_wallet: [
                {
                    coin_id: 245,
                    amount: "27782.113341961798000",
                    name: "CRV",
                    address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
                },
            ],
            coins_entering_wallet: [
                {
                    coin_id: 121,
                    amount: "28291.343703380124000",
                    name: "sdCRV",
                    address: "0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5",
                },
            ],
        },
    ],
    backrun: {
        tx_id: 137994,
        pool_id: 153,
        event_id: 336506,
        tx_hash: "0x7238d101df4a7c966334efcc0576b94b3f21de34eca86477f8fd323479769bbd",
        block_number: 17747827,
        block_unixtime: "1690018727",
        transaction_type: "swap",
        called_contract_by_user: "0xFd0000000100069aD1670066004306009B487AD7",
        trader: "0x7E645CEC19e185FBBA266D57FC608db0c4c23b06",
        tx_position: 2,
        coins_leaving_wallet: [
            {
                coin_id: 121,
                amount: "7390.402362808626000",
                name: "sdCRV",
                address: "0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5",
            },
        ],
        coins_entering_wallet: [
            {
                coin_id: 245,
                amount: "7280.810623622944000",
                name: "CRV",
                address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
            },
        ],
    },
    user_losses_details: [
        {
            unit: "sdCRV",
            unitAddress: "0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5",
            amount: 85.03290727406056,
            lossInPercentage: 0.2996609061148918,
        },
    ],
    label: "0x43E54C2E7b3e294De3A155785F52AB49d87B9922",
    poolAddress: "0xf7b55C3732aD8b2c2dA7c24f30A69f55c54FB717",
    poolName: "sdCRV",
    lossInUsd: 63.470224354673675,
};
const message = await buildSandwichMessage(sandwichDetails);
eventEmitter.emit("newMessage", message);
//# sourceMappingURL=SandwichMonitorBot.js.map