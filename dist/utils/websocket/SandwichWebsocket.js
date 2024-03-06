import { url } from "../../SandwichMonitorBot.js";
import { buildSandwichMessage } from "../../utils/telegram/TelegramBot.js";
import { io } from "socket.io-client";
export async function connectToWebsocket(eventEmitter) {
    const mainSocket = io(`${url}/main`);
    mainSocket.on("connect", () => {
        console.log("connected");
        mainSocket.emit("connectToGeneralSandwichLivestream");
        mainSocket.on("NewSandwich", async (sandwichDetails) => {
            console.log("Received NewSandwich:");
            console.dir(sandwichDetails, { depth: null, colors: true });
            const message = await buildSandwichMessage(sandwichDetails);
            eventEmitter.emit("newMessage", message);
        });
    });
}
//# sourceMappingURL=SandwichWebsocket.js.map