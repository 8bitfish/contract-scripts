const Fish = artifacts.require("BitFish");
const fs = require("fs");
const { NumberPrompt, Select } = require("enquirer");
const bMint = require("./mint/bMint");
const sMint = require("./mint/sMint");
const withdraw = require("./withdraw");
const getToken = require("./getToken");

const suite = async () => {
  const fish = await Fish.deployed();
  const { network_id } = fish.constructor;
  let network;

  if (network_id === "1") {
    network = "mainnet";
  } else if (network_id === "4") {
    network = "rinkeby";
  } else if (network_id === "137") {
    network = "polygon";
  } else if (network_id === "80001") {
    network = "mumbai";
  } else if (network_id === "5777") {
    network = "development";
  } else {
    network = "development";
  }

  const action = await new Select({
    name: "action",
    message: "Pick an action: ",
    choices: ["mint", "getToken", "withdraw", "exit"],
  }).run();

  if (action === "mint") {
    if (fs.readdirSync(`./gen/assets/generated/${network}`).length !== 0) {
      console.log(
        `⚠️ \x1b[33mFiles present in ${network} folder. If this is not intended please remove before minting.`,
      );
    }
    const mintSelection = await new Select({
      name: "mint selection",
      message: "Choose a mint method: ",
      choices: ["regular batch mint", "single special mint", "exit"],
    }).run();

    if (mintSelection === "regular batch mint") {
      const tokens = await new NumberPrompt({
        name: "number",
        message: "How many tokens would you like to mint?",
      }).run();
      const t = await bMint(fish, tokens, network);
      return console.log(
        `\n\x1b[35mSuccessfully minted ${t} token(s) on ${network} network.\x1b[0m\n`,
      );
    } else if (mintSelection === "single special mint") {
      const selection = await new Select({
        name: "special selection",
        message: "Choose special edition token: ",
        choices: ["s1 (16)", "s1 (832)", "s1 (4706)", "s1 (6673)", "exit"],
      }).run();
      if (selection === "exit") {
        return console.log("\x1b[35mExiting...\x1b[0m\n");
      }
      const t = await sMint(fish, selection, network);
      if (!t) {
        return console.log(
          `\n\x1b[31mFailed to mint special token on ${network} network.\x1b[0m\n`,
        );
      } else {
        return console.log(
          `\n\x1b[35mSuccessfully minted ${t} token(s) on ${network} network.\x1b[0m\n`,
        );
      }
    } else if (mintSelection === "exit") {
      return console.log("\x1b[35mExiting...\x1b[0m\n");
    }
  } else if (action === "getToken") {
    let tokens = Number(await fish.totalSupply());
    if (tokens === 0) {
      return console.log("No tokens to get, exiting...");
    } else {
      const token = await new NumberPrompt({
        name: "number",
        message: `There are ${tokens} tokens which one would you like?`,
      }).run();

      const uri = await getToken(fish, token);
      return console.log(uri);
    }
  } else if (action === "withdraw") {
    return await withdraw(fish);
  } else if (action === "exit") {
    return console.log("\x1b[35mExiting...\x1b[0m\n");
  } else {
    return console.log("No prompt chosen, exiting...");
  }
};

module.exports = suite;
