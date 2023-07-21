import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io } from "socket.io-client";

export interface Coin {
  coin_id: number;
  amount: string;
  name: string;
  address: string;
}

export interface TransactionDetails {
  tx_id: number;
  pool_id: number;
  event_id: number;
  tx_hash: string;
  block_number: number;
  block_unixtime: string;
  transaction_type: string;
  called_contract_by_user: string;
  trader: string;
  tx_position: number;
  coins_leaving_wallet: Coin[];
  coins_entering_wallet: Coin[];
}

export interface UserLossDetail {
  unit: string;
  unitAddress: string;
  amount: number;
  lossInPercentage: number;
}

export interface SandwichDetails {
  frontrun: TransactionDetails;
  center: TransactionDetails[];
  backrun: TransactionDetails;
  user_losses_details: UserLossDetail[];
  label: string;
  poolAddress: string;
  poolName: string;
  lossInUsd: string;
}

//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";

export async function connectToWebsocket(eventEmitter: any) {
  const mainSocket = io(`${url}/main`);

  mainSocket.on("connect", () => {
    console.log("connected");
    mainSocket.emit("connectToGeneralSandwichLivestream");

    mainSocket.on("NewSandwich", async (sandwichDetails: SandwichDetails) => {
      console.log("Received NewSandwich:");
      console.dir(sandwichDetails, { depth: null, colors: true });
      const message = await buildSandwichMessage(sandwichDetails);
      eventEmitter.emit("newMessage", message);
    });
  });
}
