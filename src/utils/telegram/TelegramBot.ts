import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { labels } from "../../Labels.js";
import { SandwichDetails } from "../websocket/SandwichWebsocket.js";
dotenv.config({ path: "../.env" });

function getTokenURL(tokenAddress: string): string {
  return "https://etherscan.io/token/" + tokenAddress;
}

function getPoolURL(poolAddress: string) {
  return "https://etherscan.io/address/" + poolAddress;
}

function getTxHashURLfromEtherscan(txHash: string) {
  return "https://etherscan.io/tx/" + txHash;
}

function getTxHashURLfromEigenPhi(txHash: string) {
  return "https://eigenphi.io/mev/eigentx/" + txHash;
}

function getBuyerURL(buyerAddress: string) {
  return "https://etherscan.io/address/" + buyerAddress;
}

function formatForPrint(someNumber: any) {
  if (typeof someNumber === "string" && someNumber.includes(",")) return someNumber;
  if (someNumber > 100) {
    someNumber = Number(Number(someNumber).toFixed(0)).toLocaleString();
  } else {
    someNumber = Number(Number(someNumber).toFixed(2)).toLocaleString();
  }
  return someNumber;
}

function getShortenNumber(amountStr: any) {
  let amount = parseFloat(amountStr.replace(/,/g, ""));
  //amount = roundToNearest(amount);
  if (amount >= 1000000) {
    const millionAmount = amount / 1000000;
    if (Number.isInteger(millionAmount)) {
      return `${millionAmount.toFixed(0)}M`;
    } else {
      return `${millionAmount.toFixed(2)}M`;
    }
  } else if (amount >= 1000) {
    const thousandAmount = amount / 1000;
    if (Number.isInteger(thousandAmount)) {
      return `${thousandAmount.toFixed(0)}k`;
    } else {
      return `${thousandAmount.toFixed(1)}k`;
    }
  } else {
    return `${amount.toFixed(2)}`;
  }
}

function getDollarAddOn(amountStr: any) {
  let amount = parseFloat(amountStr.replace(/,/g, ""));
  //amount = roundToNearest(amount);
  if (amount >= 1000000) {
    const millionAmount = amount / 1000000;
    if (Number.isInteger(millionAmount)) {
      return ` ($${millionAmount.toFixed(0)}M)`;
    } else {
      return ` ($${millionAmount.toFixed(2)}M)`;
    }
  } else if (amount >= 1000) {
    const thousandAmount = amount / 1000;
    if (Number.isInteger(thousandAmount)) {
      return ` ($${thousandAmount.toFixed(0)}k)`;
    } else {
      return ` ($${thousandAmount.toFixed(1)}k)`;
    }
  } else {
    return ` ($${amount.toFixed(2)})`;
  }
}

function hyperlink(link: string, name: string): string {
  return "<a href='" + link + "/'> " + name + "</a>";
}

let sentMessages: Record<string, boolean> = {};
export function send(bot: any, message: string, groupID: number) {
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

function shortenAddress(address: string): string {
  return address.slice(0, 5) + ".." + address.slice(-2);
}

function getAddressName(address: string): string {
  // Find label for address
  const labelObject = labels.find((label: { Address: string }) => label.Address.toLowerCase() === address.toLowerCase());

  // If label found, return it. Otherwise, return shortened address
  return labelObject ? labelObject.Label : shortenAddress(address);
}

export async function buildSandwichMessage(sandwich: SandwichDetails) {
  let value = sandwich.lossInUsd;
  const POOL_URL_ETHERSCAN = getPoolURL(sandwich.poolAddress);
  const POOL_NAME = sandwich.poolName;
  const LABEL_URL_ETHERSCAN = getPoolURL(sandwich.center[0].called_contract_by_user);
  let labelName = sandwich.label;
  if (labelName === "Metamask: Swap Router") labelName = "Metamask: Clown Router";
  let CENTER_TX_HASH_URL_ETHERSCAN, centerAmountOut, centerNameOut, centerAmountIn, centerNameIn;
  let centerCoinInUrl = "";
  let centerCoinOutUrl = "";

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
  } else if (sandwich.center[0].transaction_type === "deposit") {
    centerAmountIn = sandwich.center[0].coins_entering_wallet[0].amount;
    centerCoinInUrl = getTokenURL(sandwich.center[0].coins_entering_wallet[0].address);
    centerNameIn = sandwich.center[0].coins_entering_wallet[0].name;
  } else if (sandwich.center[0].transaction_type === "remove") {
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
    let centerNameOut = sandwich.center[0].coins_leaving_wallet[0]?.name ?? "";
    let centerNameIn = sandwich.center[0].coins_entering_wallet[0]?.name ?? "";
    centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl!, centerNameOut)} ➛ ${formatForPrint(
      centerAmountIn
    )}${hyperlink(centerCoinInUrl!, centerNameIn)}`;
  } else if (sandwich.center[0].transaction_type === "deposit") {
    let centerNameIn = sandwich.center[0].coins_entering_wallet[0]?.name ?? "";
    centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: deposited ${formatForPrint(centerAmountIn)}${hyperlink(centerCoinInUrl!, centerNameIn)}`;
  } else if (sandwich.center[0].transaction_type === "remove") {
    let centerNameOut = sandwich.center[0].coins_leaving_wallet[0]?.name ?? "";
    centerMessage = `${hyperlink(CENTER_TX_HASH_URL_ETHERSCAN, "Center")}: removed ${formatForPrint(centerAmountOut)}${hyperlink(centerCoinOutUrl!, centerNameOut)}`;
  }

  let lossStatement;
  if (value && !isNaN(value)) {
    lossStatement = `${hyperlink(centerBuyerURL, shortenCenterBuyer)} lost ${formatForPrint(lostAmount)}${hyperlink(
      lostCoinOutUrl,
      lostCoinNameOut
    )} (that's -${percentage}% slippage, or $${value.toFixed(2)})`;
  } else {
    lossStatement = `${hyperlink(centerBuyerURL, shortenCenterBuyer)} lost ${formatForPrint(lostAmount)}${hyperlink(
      lostCoinOutUrl,
      lostCoinNameOut
    )} (that's -${percentage}% slippage)`;
  }

  return `
Sandwich spotted in${POOL}

${hyperlink(FRONTRUN_TX_HASH_URL_ETHERSCAN, "Frontrun")}: ${formatForPrint(frontrunAmountOut)}${hyperlink(frontrunCoinOutUrl, frontrunNameOut)} ➛ ${formatForPrint(
    frontrunAmountIn
  )}${hyperlink(frontrunCoinInUrl, frontrunNameIn)}
${centerMessage}
${hyperlink(BACKRUN_TX_HASH_URL_ETHERSCAN, "Backrun")}: ${formatForPrint(backrunAmountOut)}${hyperlink(backrunCoinOutUrl, backrunNameOut)} ➛ ${formatForPrint(
    backrunAmountIn
  )}${hyperlink(backrunCoinInUrl, backrunNameIn)}

Affected Contract: ${LABEL}

${lossStatement}
`;
}

export async function telegramBotMain(env: string, eventEmitter: EventEmitter) {
  eventEmitter.on("newMessage", (message: string) => {
    if (groupID) {
      send(bot, message, parseInt(groupID));
    }
  });

  let telegramGroupToken: string | undefined;
  let groupID: string | undefined;

  if (env == "prod") {
    telegramGroupToken = process.env.TELEGRAM_SANDWICHMONITOR_PROD_KEY!;
    groupID = process.env.TELEGRAM_PROD_GROUP_ID!;
  }
  if (env == "test") {
    telegramGroupToken = process.env.TELEGRAM_SANDWICHMONITOR_TEST_KEY!;
    groupID = process.env.TELEGRAM_TEST_GROUP_ID!;
  }

  const bot = new TelegramBot(telegramGroupToken!, { polling: true });

  bot.on("message", async (msg) => {
    if (msg.text === "bot u with us") {
      await new Promise((resolve) => setTimeout(resolve, 850));
      if (groupID) {
        bot.sendMessage(msg.chat.id, "right here ser");
      }
    }
  });
}
