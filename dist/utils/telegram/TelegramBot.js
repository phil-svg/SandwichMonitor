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
function getProfitPrint(profit, revenue, cost) {
    // if (Number(revenue) < Number(cost)) {
    //   return `Profit: ? | Revenue: ? | Cost: $${formatForPrint(cost)}`;
    // }
    if (profit > revenue * 0.5)
        return `Revenue: ¯⧵_(ツ)_/¯`;
    return `Profit: $${formatForPrint(profit)} | Revenue: $${formatForPrint(revenue)} | Cost: $${formatForPrint(cost)}`;
}
function getMarketHealthPrint(qtyCollat, collateralName, collatValue, marketBorrowedAmount) {
    collatValue = formatForPrint(collatValue);
    marketBorrowedAmount = formatForPrint(marketBorrowedAmount);
    qtyCollat = formatForPrint(qtyCollat);
    return `Collateral: ${getShortenNumber(qtyCollat)} ${collateralName}${getDollarAddOn(collatValue)} | Borrowed: ${getShortenNumber(marketBorrowedAmount)} crvUSD`;
}
function formatForPrint(someNumber) {
    if (typeof someNumber === "string" && someNumber.includes(","))
        return someNumber;
    //someNumber = Math.abs(someNumber);
    if (someNumber > 100) {
        someNumber = Number(Number(someNumber).toFixed(0)).toLocaleString();
    }
    else if (someNumber > 5) {
        someNumber = Number(Number(someNumber).toFixed(2)).toLocaleString();
    }
    else {
        someNumber = Number(Number(someNumber).toFixed(2)).toLocaleString();
    }
    return someNumber;
}
function getShortenNumber(amountStr) {
    let amount = parseFloat(amountStr.replace(/,/g, ""));
    //amount = roundToNearest(amount);
    if (amount >= 1000000) {
        const millionAmount = amount / 1000000;
        if (Number.isInteger(millionAmount)) {
            return `${millionAmount.toFixed(0)}M`;
        }
        else {
            return `${millionAmount.toFixed(2)}M`;
        }
    }
    else if (amount >= 1000) {
        const thousandAmount = amount / 1000;
        if (Number.isInteger(thousandAmount)) {
            return `${thousandAmount.toFixed(0)}k`;
        }
        else {
            return `${thousandAmount.toFixed(1)}k`;
        }
    }
    else {
        return `${amount.toFixed(2)}`;
    }
}
function getDollarAddOn(amountStr) {
    let amount = parseFloat(amountStr.replace(/,/g, ""));
    //amount = roundToNearest(amount);
    if (amount >= 1000000) {
        const millionAmount = amount / 1000000;
        if (Number.isInteger(millionAmount)) {
            return ` ($${millionAmount.toFixed(0)}M)`;
        }
        else {
            return ` ($${millionAmount.toFixed(2)}M)`;
        }
    }
    else if (amount >= 1000) {
        const thousandAmount = amount / 1000;
        if (Number.isInteger(thousandAmount)) {
            return ` ($${thousandAmount.toFixed(0)}k)`;
        }
        else {
            return ` ($${thousandAmount.toFixed(1)}k)`;
        }
    }
    else {
        return ` ($${amount.toFixed(2)})`;
    }
}
function hyperlink(link, name) {
    return "<a href='" + link + "/'> " + name + "</a>";
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
    // Delete the message from tracking after 30 seconds
    setTimeout(() => {
        delete sentMessages[key];
    }, 30000); // 30000 ms = 30 seconds
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
    const POOL_URL_ETHERSCAN = getPoolURL(sandwich.poolAddress);
    const POOL_NAME = sandwich.poolName;
    const LABEL_URL_ETHERSCAN = getPoolURL(sandwich.center[0].called_contract_by_user);
    let labelName = sandwich.label;
    let CENTER_TX_HASH_URL_ETHERSCAN, centerAmountOut, centerCoinOutUrl, centerNameOut, centerAmountIn, centerCoinInUrl, centerNameIn;
    const FRONTRUN_TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(sandwich.frontrun.tx_hash);
    let frontrunAmountOut = sandwich.frontrun.coins_leaving_wallet[0].amount;
    let frontrunCoinOutUrl = getTokenURL(sandwich.frontrun.coins_leaving_wallet[0].address);
    let frontrunNameOut = sandwich.frontrun.coins_leaving_wallet[0].name;
    let frontrunAmountIn = sandwich.frontrun.coins_entering_wallet[0].amount;
    let frontrunCoinInUrl = getTokenURL(sandwich.frontrun.coins_entering_wallet[0].address);
    let frontrunNameIn = sandwich.frontrun.coins_entering_wallet[0].name;
    CENTER_TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(sandwich.center[0].tx_hash);
    if (sandwich.center[0].transaction_type === "swap") {
        centerAmountOut = sandwich.center[0].coins_leaving_wallet[0].amount;
        centerCoinOutUrl = getTokenURL(sandwich.center[0].coins_leaving_wallet[0].address);
        centerNameOut = sandwich.center[0].coins_leaving_wallet[0].name;
        centerAmountIn = sandwich.center[0].coins_entering_wallet[0].amount;
        centerCoinInUrl = getTokenURL(sandwich.center[0].coins_entering_wallet[0].address);
        centerNameIn = sandwich.center[0].coins_entering_wallet[0].name;
    }
    else if (sandwich.center[0].transaction_type === "deposit") {
        centerAmountIn = sandwich.center[0].coins_entering_wallet[0].amount;
        centerCoinInUrl = getTokenURL(sandwich.center[0].coins_entering_wallet[0].address);
        centerNameIn = sandwich.center[0].coins_entering_wallet[0].name;
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
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl, centerNameOut)} ➛ ${formatForPrint(centerAmountIn)}${hyperlink(centerCoinInUrl, centerNameIn)}`;
    }
    else if (sandwich.center[0].transaction_type === "deposit") {
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: deposited ${formatForPrint(centerAmountIn)}${hyperlink(centerCoinInUrl, centerNameIn)}`;
    }
    else if (sandwich.center[0].transaction_type === "remove") {
        centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: removed ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl, centerNameOut)}`;
    }
    return `

  ......
Sandwich spotted in${POOL}

${hyperlink(FRONTRUN_TX_HASH_URL_ETHERSCAN, "Frontrun")}: ${formatForPrint(frontrunAmountOut)}${hyperlink(frontrunCoinOutUrl, frontrunNameOut)} ➛ ${formatForPrint(frontrunAmountIn)}${hyperlink(frontrunCoinInUrl, frontrunNameIn)}
${centerMessage}
${hyperlink(BACKRUN_TX_HASH_URL_ETHERSCAN, "Backrun")}: ${formatForPrint(backrunAmountOut)}${hyperlink(backrunCoinOutUrl, backrunNameOut)} ➛ ${formatForPrint(backrunAmountIn)}${hyperlink(backrunCoinInUrl, backrunNameIn)}

${hyperlink(centerBuyerURL, shortenCenterBuyer)} lost ${formatForPrint(lostAmount)}${hyperlink(lostCoinOutUrl, lostCoinNameOut)} (that's ${percentage}%)

Called Contract: ${LABEL}
......

`;
}
export async function buildDepositMessage(formattedEventData) {
    let { crvUSD_price, borrowerHealth, marketCap, qtyCollat, collatValue, marketBorrowedAmount, collateralAddress, collateralName, borrowedAmount, txHash, buyer, crvUSDinCirculation, borrowRate, } = formattedEventData;
    const buyerURL = getBuyerURL(buyer);
    const shortenBuyer = getAddressName(buyer);
    const COLLATERAL_URL = getTokenURL(collateralAddress);
    const TX_HASH_URL_ETHERSCAN = getTxHashURLfromEtherscan(txHash);
    const TX_HASH_URL_EIGENPHI = getTxHashURLfromEigenPhi(txHash);
    borrowedAmount = formatForPrint(borrowedAmount);
    crvUSDinCirculation = formatForPrint(crvUSDinCirculation);
    let marketHealthPrint = getMarketHealthPrint(qtyCollat, collateralName, collatValue, marketBorrowedAmount);
    if (borrowerHealth !== "no loan")
        borrowerHealth = formatForPrint(borrowerHealth * 100);
    return `
  🚀${hyperlink(buyerURL, shortenBuyer)} deposited ${borrowedAmount}${hyperlink(COLLATERAL_URL, collateralName)}
Health of Borrower: ${borrowerHealth}
Borrow Rate: ${formatForPrint(borrowRate)}%
${marketHealthPrint}
Marketcap: ${getShortenNumber(formatForPrint(marketCap))}  | Total borrowed: ${getShortenNumber(formatForPrint(crvUSDinCirculation))} | Price: ${crvUSD_price.toFixed(4)}  
Links:${hyperlink(TX_HASH_URL_ETHERSCAN, "etherscan.io")} |${hyperlink(TX_HASH_URL_EIGENPHI, "eigenphi.io")} 🦙🦙🦙
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