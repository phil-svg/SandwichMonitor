import { priceTransaction } from "../../txValue/PriceTransaction.js";
import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io, Socket } from "socket.io-client";

//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";

export async function connectToWebsocket(eventEmitter: any) {
  const mainSocket = io(`${url}/main`);

  mainSocket.on("connect", () => {
    console.log("connected");
    mainSocket.emit("connectToGeneralSandwichLivestream");

    mainSocket.on("NewSandwich", async (enrichedSandwich: any) => {
      // console.log("Received result: ", enrichedSandwich);
      const value = await priceTransaction(enrichedSandwich.center[0]);
      const message = await buildSandwichMessage(enrichedSandwich, value);
      eventEmitter.emit("newMessage", message);
    });
  });
}
