import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io } from "socket.io-client";

//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";

export async function connectToWebsocket(eventEmitter: any) {
  const mainSocket = io(`${url}/main`);

  mainSocket.on("connect", () => {
    console.log("connected");
    mainSocket.emit("connectToGeneralSandwichLivestream");

    mainSocket.on("NewSandwich", async (sandwichDetails: any) => {
      // console.log("Received result: ", enrichedSandwich);
      const message = await buildSandwichMessage(sandwichDetails);
      eventEmitter.emit("newMessage", message);
    });
  });
}
