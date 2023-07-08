import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io, Socket } from "socket.io-client";

//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";

export async function connectToWebsocket(eventEmitter: any) {
  const mainSocket = io(`${url}/main`);

  mainSocket.on("connect", () => {
    console.log("connected");
    mainSocket.emit("connectToGeneralSandwichLivestream");

    mainSocket.on("Received new sandwich", async (enrichedSandwich: any) => {
      //console.log("Received result: ", sandwich);
      const message = await buildSandwichMessage(enrichedSandwich);
      eventEmitter.emit("newMessage", message);
    });
  });
}
