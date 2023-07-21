import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io } from "socket.io-client";

enum TransactionType {
  Swap = "swap",
  Deposit = "deposit",
  Remove = "remove",
}

export interface SandwichDetail {
  frontrun: TransactionDetail;
  center: TransactionDetail[];
  backrun: TransactionDetail;
  user_losses_details: UserLossDetail[];
  label: string;
  poolAddress: string;
  poolName: string;
  lossInUsd: number;
}

interface TransactionDetail {
  tx_id: number;
  pool_id: number;
  event_id?: number;
  tx_hash: string;
  block_number: number;
  block_unixtime: number;
  transaction_type: TransactionType;
  called_contract_by_user: string;
  trader: string;
  tx_position: number;
  coins_leaving_wallet: CoinDetail[];
  coins_entering_wallet: CoinDetail[];
}

interface CoinDetail {
  coin_id: number;
  amount: number;
  name: string;
  address: string;
}

interface UserLossDetail {
  unit: string;
  unitAddress: string;
  amount: number;
  lossInPercentage: number;
}

//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";

export async function connectToWebsocket(eventEmitter: any) {
  const mainSocket = io(`${url}/main`);

  mainSocket.on("connect", () => {
    console.log("connected");
    mainSocket.emit("connectToGeneralSandwichLivestream");

    mainSocket.on("NewSandwich", async (sandwichDetails: SandwichDetail) => {
      console.log("Received NewSandwich:");
      console.dir(sandwichDetails, { depth: null, colors: true });
      const message = await buildSandwichMessage(sandwichDetails);
      eventEmitter.emit("newMessage", message);
    });
  });
}
