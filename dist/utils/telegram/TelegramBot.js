import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { labels } from "../../Labels.js";
dotenv.config({ path: "../.env" });
function getTokenURL(tokenAddress) {
    return "https://etherscan.io/token/" + tokenAddress;
}
function getPoolURL(poolAddress) {
    return "https://etherscan.io/address/" + poolAddress;
}
function getTxHashURLfromEtherscan(txHash) {
    return "https://etherscan.io/tx/" + txHash;
}
function getTxHashURLfromEigenPhi(txHash) {
    return "https://eigenphi.io/mev/eigentx/" + txHash;
}
function getBuyerURL(buyerAddress) {
    return "https://etherscan.io/address/" + buyerAddress;
}
function formatForPrint(someNumber) {
    if (typeof someNumber === "string" && someNumber.includes(","))
        return someNumber;
    if (someNumber > 100) {
        someNumber = Number(Number(someNumber).toFixed(0)).toLocaleString();
    }
    else {
        someNumber = Number(Number(someNumber).toFixed(2)).toLocaleString();
    }
    return someNumber;
}
function hyperlink(link, name) {
    return "<a href='" + link + "/'> " + name + "</a>";
}
function getBlockUrlEtherscan(blockNumber) {
    return "https://etherscan.io/block/" + blockNumber;
}
function getBlockLinkEtherscan(blockNumber) {
    const url = getBlockUrlEtherscan(blockNumber);
    const link = hyperlink(url, blockNumber.toString());
    return link;
}
function formatExecutionPrice(price) {
    if (price > 100) {
        // For numbers greater than 100, round to 2 decimal places
        return price.toFixed(2);
    }
    else if (price < 1) {
        const priceStr = price.toString();
        // Check if price is less than 1 and starts with leading 9's after the decimal point
        const leading9sMatch = priceStr.match(/0\.9*/);
        if (leading9sMatch) {
            const leading9s = leading9sMatch[0];
            // Calculate the number of characters to include: all leading 9's plus two more digits
            const endIndex = leading9s.length + 3;
            // Extract the substring and parse it to ensure correct rounding
            return parseFloat(priceStr.substring(0, endIndex)).toString();
        }
        else {
            // If there are no leading 9's, round to 4 decimal places
            return price.toFixed(4);
        }
    }
    else {
        // For numbers between 1 and 100, round to 4 decimal places
        return price.toFixed(4);
    }
}
function findUnderstandableExecutionPriceAndDenomination(priceA, priceB, coinLeavingWalletName, coinEnteringWalletName) {
    let price = 0;
    let denomination = "";
    if (priceA > 2) {
        price = priceA;
        denomination = `${coinLeavingWalletName}/${coinEnteringWalletName}`;
    }
    else if (priceB > 2) {
        price = priceB;
        denomination = `${coinEnteringWalletName}/${coinLeavingWalletName}`;
    }
    else {
        price = Math.min(priceA, priceB);
        // Decide the denomination based on which price (A or B) is smaller
        denomination = price === priceA ? `${coinLeavingWalletName}/${coinEnteringWalletName}` : `${coinEnteringWalletName}/${coinLeavingWalletName}`;
    }
    const formattedPrice = formatExecutionPrice(price);
    return [formattedPrice, denomination.toLowerCase()]; // Return both values as an array
}
let sentMessages = {};
export function send(bot, message, groupID) {
    const key = `${groupID}:${message}`;
    if (sentMessages[key]) {
        console.log("This message has already been sent to this group in the past 30 seconds.");
        return;
    }
    bot.sendMessage(groupID, message, { parse_mode: "HTML", disable_web_page_preview: "true" });
    // Track the message as sent
    sentMessages[key] = true;
    // Delete the message from tracking after 5 minutes
    setTimeout(() => {
        delete sentMessages[key];
    }, 5 * 60 * 1000);
}
function shortenAddress(address) {
    return address.slice(0, 5) + ".." + address.slice(-2);
}
function getAddressName(address) {
    // Find label for address
    const labelObject = labels.find((label) => label.Address.toLowerCase() === address.toLowerCase());
    // If label found, return it. Otherwise, return shortened address
    return labelObject ? labelObject.Label : shortenAddress(address);
}
export async function buildSandwichMessage(sandwich) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let value = sandwich.lossInUsd;
    const POOL_URL_ETHERSCAN = getPoolURL(sandwich.poolAddress);
    const POOL_NAME = sandwich.poolName;
    const LABEL_URL_ETHERSCAN = getPoolURL(sandwich.center[0].called_contract_by_user);
    let labelName = sandwich.label;
    if (labelName.startsWith("0x") && labelName.length === 42) {
        labelName = shortenAddress(labelName);
    }
    // if (labelName === "Metamask: Swap Router") labelName = "Metamask: Clown Router";
    let CENTER_TX_HASH_URL_ETHERSCAN, centerAmountOut, centerNameOut, centerAmountIn, centerNameIn;
    let centerCoinInUrl = "";
    let centerCoinOutUrl = "";
    const blockNumber = sandwich.backrun.block_number;
    const blockLinkEtherscan = getBlockLinkEtherscan(blockNumber);
    let priceAndBlocknumberTag = `Block:${blockLinkEtherscan} | Index Frontrun: ${sandwich.frontrun.tx_position}`;
    const FRONTRUN_TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(sandwich.frontrun.tx_hash);
    let frontrunAmountOut = sandwich.frontrun.coins_leaving_wallet[0].amount;
    let frontrunCoinOutUrl = getTokenURL(sandwich.frontrun.coins_leaving_wallet[0].address);
    let frontrunNameOut = sandwich.frontrun.coins_leaving_wallet[0].name;
    let frontrunAmountIn = sandwich.frontrun.coins_entering_wallet[0].amount;
    let frontrunCoinInUrl = getTokenURL(sandwich.frontrun.coins_entering_wallet[0].address);
    let frontrunNameIn = sandwich.frontrun.coins_entering_wallet[0].name;
    CENTER_TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(sandwich.center[0].tx_hash);
    const centerTxCoinLeavingDetails = sandwich.center[0].coins_leaving_wallet[0];
    const centerTxCoinEnteringDetails = sandwich.center[0].coins_entering_wallet[0];
    if (sandwich.center[0].transaction_type === "swap") {
        centerAmountOut = centerTxCoinLeavingDetails.amount;
        centerCoinOutUrl = getTokenURL(centerTxCoinLeavingDetails.address);
        centerNameOut = centerTxCoinLeavingDetails.name;
        centerAmountIn = centerTxCoinEnteringDetails.amount;
        centerCoinInUrl = getTokenURL(centerTxCoinEnteringDetails.address);
        centerNameIn = centerTxCoinEnteringDetails.name;
        let priceA = Number(centerTxCoinLeavingDetails.amount) / Number(centerTxCoinEnteringDetails.amount);
        let priceB = Number(centerTxCoinEnteringDetails.amount) / Number(centerTxCoinLeavingDetails.amount);
        let [executionPrice, denominationTag] = findUnderstandableExecutionPriceAndDenomination(priceA, priceB, centerTxCoinLeavingDetails.name, centerTxCoinEnteringDetails.name);
        priceAndBlocknumberTag = `Execution Price Center: ${executionPrice} (${denominationTag})\nBlock:${blockLinkEtherscan} | Index Frontrun: ${sandwich.frontrun.tx_position}`;
    }
    else if (sandwich.center[0].transaction_type === "deposit") {
        centerAmountIn = centerTxCoinEnteringDetails.amount;
        centerCoinInUrl = getTokenURL(centerTxCoinEnteringDetails.address);
        centerNameIn = centerTxCoinEnteringDetails.name;
    }
    else if (sandwich.center[0].transaction_type === "remove") {
        centerAmountOut = sandwich.center[0].coins_leaving_wallet[0].amount;
        centerCoinOutUrl = getTokenURL(sandwich.center[0].coins_leaving_wallet[0].address);
        centerNameOut = sandwich.center[0].coins_leaving_wallet[0].name;
    }
    const BACKRUN_TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(sandwich.backrun.tx_hash);
    let backrunAmountOut = sandwich.backrun.coins_leaving_wallet[0].amount;
    let backrunCoinOutUrl = getTokenURL(sandwich.backrun.coins_leaving_wallet[0].address);
    let backrunNameOut = sandwich.backrun.coins_leaving_wallet[0].name;
    let backrunAmountIn = sandwich.backrun.coins_entering_wallet[0].amount;
    let backrunCoinInUrl = getTokenURL(sandwich.backrun.coins_entering_wallet[0].address);
    let backrunNameIn = sandwich.backrun.coins_entering_wallet[0].name;
    let centerBuyerURL = getBuyerURL(sandwich.center[0].trader);
    let shortenCenterBuyer = shortenAddress(sandwich.center[0].trader);
    let lostAmount = sandwich.user_losses_details[0].amount;
    let lostCoinOutUrl = getTokenURL(sandwich.user_losses_details[0].unitAddress);
    let lostCoinNameOut = sandwich.user_losses_details[0].unit;
    let percentage = sandwich.user_losses_details[0].lossInPercentage;
    percentage = Number(percentage.toFixed(2));
    const POOL = hyperlink(POOL_URL_ETHERSCAN, POOL_NAME);
    const LABEL = hyperlink(LABEL_URL_ETHERSCAN, labelName);
    let centerMessage;
    if (sandwich.center[0].transaction_type === "swap") {
        let centerNameOut = (_b = (_a = sandwich.center[0].coins_leaving_wallet[0]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "";
        let centerNameIn = (_d = (_c = sandwich.center[0].coins_entering_wallet[0]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "";
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl, centerNameOut)} ➛ ${formatForPrint(centerAmountIn)}${hyperlink(centerCoinInUrl, centerNameIn)}`;
    }
    else if (sandwich.center[0].transaction_type === "deposit") {
        let centerNameIn = (_f = (_e = sandwich.center[0].coins_entering_wallet[0]) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : "";
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: deposited ${formatForPrint(centerAmountIn)}${hyperlink(centerCoinInUrl, centerNameIn)}`;
    }
    else if (sandwich.center[0].transaction_type === "remove") {
        let centerNameOut = (_h = (_g = sandwich.center[0].coins_leaving_wallet[0]) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : "";
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: removed ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl, centerNameOut)}`;
    }
    let lossStatement;
    if (value && !isNaN(value)) {
        lossStatement = `${hyperlink(centerBuyerURL, shortenCenterBuyer)} lost ${formatForPrint(lostAmount)}${hyperlink(lostCoinOutUrl, lostCoinNameOut)} (that's -${percentage}% slippage, or $${value.toFixed(2)})`;
    }
    else {
        lossStatement = `${hyperlink(centerBuyerURL, shortenCenterBuyer)} lost ${formatForPrint(lostAmount)}${hyperlink(lostCoinOutUrl, lostCoinNameOut)} (that's -${percentage}% slippage)`;
    }
    return `
Sandwich spotted in${POOL}

${hyperlink(FRONTRUN_TX_HASH_URL_ETHERSCAN, "Frontrun")}: ${formatForPrint(frontrunAmountOut)}${hyperlink(frontrunCoinOutUrl, frontrunNameOut)} ➛ ${formatForPrint(frontrunAmountIn)}${hyperlink(frontrunCoinInUrl, frontrunNameIn)}
${centerMessage}
${hyperlink(BACKRUN_TX_HASH_URL_ETHERSCAN, "Backrun")}: ${formatForPrint(backrunAmountOut)}${hyperlink(backrunCoinOutUrl, backrunNameOut)} ➛ ${formatForPrint(backrunAmountIn)}${hyperlink(backrunCoinInUrl, backrunNameIn)}

${priceAndBlocknumberTag}
Affected Contract: ${LABEL}

${lossStatement}
`;
}
export async function telegramBotMain(env, eventEmitter) {
    eventEmitter.on("newMessage", (message) => {
        if (groupID) {
            send(bot, message, parseInt(groupID));
        }
    });
    let telegramGroupToken;
    let groupID;
    if (env == "prod") {
        telegramGroupToken = process.env.TELEGRAM_SANDWICHMONITOR_PROD_KEY;
        groupID = process.env.TELEGRAM_PROD_GROUP_ID;
    }
    if (env == "test") {
        telegramGroupToken = process.env.TELEGRAM_SANDWICHMONITOR_TEST_KEY;
        groupID = process.env.TELEGRAM_TEST_GROUP_ID;
    }
    const bot = new TelegramBot(telegramGroupToken, { polling: true });
    bot.on("message", async (msg) => {
        if (msg.text === "bot u with us") {
            await new Promise((resolve) => setTimeout(resolve, 850));
            if (groupID) {
                bot.sendMessage(msg.chat.id, "right here ser");
            }
        }
    });
}
//# sourceMappingURL=TelegramBot.js.map