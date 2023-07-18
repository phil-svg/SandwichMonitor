import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io } from "socket.io-client";
//const url = "http://localhost:443";
const url = "wss://api.curvemonitor.com";
export async function connectToWebsocket(eventEmitter) {
    const mainSocket = io(`${url}/main`);
    mainSocket.on("connect", () => {
        console.log("connected");
        mainSocket.emit("connectToGeneralSandwichLivestream");
        mainSocket.on("NewSandwich", async (enrichedSandwich) => {
            // console.log("Received result: ", enrichedSandwich);
            const message = await buildSandwichMessage(enrichedSandwich, "foo");
            eventEmitter.emit("newMessage", message);
        });
    });
}
//# sourceMappingURL=SandwichWebsocket.js.map