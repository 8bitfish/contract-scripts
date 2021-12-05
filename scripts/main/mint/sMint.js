require("dotenv").config();
const fs = require("fs");
const PrismaClientPkg = require("@prisma/client");
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

function loadingAnimation(
  text = "",
  chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
  delay = 100,
) {
  let x = 0;

  return setInterval(function () {
    process.stdout.write(`\r${chars[x++]} ${text}`);
    x = x % chars.length;
  }, delay);
}

module.exports = async (fish, selection, network) => {
  const tokenId = Number(await fish.totalSupply()) + 1;
  const { s1, s2, s3, s4 } = {
    s1: {
      tokenId: process.env.SPECIAL_1,
      hash: process.env.SPECIAL_1_HASH,
      imageHash: process.env.SPECIAL_1_IMAGE_HASH,
      pattern: process.env.SPECIAL_1_PATTERN,
      primary: process.env.SPECIAL_1_PRIMARY,
      secondary: process.env.SPECIAL_1_SECONDARY,
    },
    s2: {
      tokenId: process.env.SPECIAL_2,
      hash: process.env.SPECIAL_2_HASH,
      imageHash: process.env.SPECIAL_2_IMAGE_HASH,
      pattern: process.env.SPECIAL_2_PATTERN,
      primary: process.env.SPECIAL_2_PRIMARY,
      secondary: process.env.SPECIAL_2_SECONDARY,
    },
    s3: {
      tokenId: process.env.SPECIAL_3,
      hash: process.env.SPECIAL_3_HASH,
      imageHash: process.env.SPECIAL_3_IMAGE_HASH,
      pattern: process.env.SPECIAL_3_PATTERN,
      primary: process.env.SPECIAL_3_PRIMARY,
      secondary: process.env.SPECIAL_3_SECONDARY,
    },
    s4: {
      tokenId: process.env.SPECIAL_4,
      hash: process.env.SPECIAL_4_HASH,
      imageHash: process.env.SPECIAL_4_IMAGE_HASH,
      pattern: process.env.SPECIAL_4_PATTERN,
      primary: process.env.SPECIAL_4_PRIMARY,
      secondary: process.env.SPECIAL_4_SECONDARY,
    },
  };

  const checkAndMint = async (expectedId, s) => {
    const { tokenId, hash, imageHash, pattern, primary, secondary } = s;
    let loader = loadingAnimation(
      `Generating fish with tokenId of ${tokenId} on ${network} network...`,
    );
    const uriUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    if (Number(tokenId) === expectedId) {
      const { tx } = await fish.mint(hash, uriUrl);
      clearInterval(loader);
      await fs.promises.mkdir(
        `./gen/assets/generated/${network}/token ${tokenId}/`,
      );

      await prisma.bitFish.create({
        data: {
          tokenId: Number(tokenId),
          network: network,
          jsonHash: hash,
          imageHash: imageHash,
          pattern: pattern,
          primaryColor: primary,
          secondaryColor: secondary,
        },
      });

      console.log(
        `\n\x1b[32m🌿 Successfully minted special token \x1b[33m${tokenId}\x1b[32m with tx of \x1b[33m${tx}\x1b[0m`,
      );

      return Number(tokenId);
    } else {
      clearInterval(loader);
      console.log(
        `\x1b[31mSpecial id (${tokenId}) does not match expected id (${expectedId})`,
      );
      return false;
    }
  };

  if (selection === "s1 (16)") {
    const r = await checkAndMint(tokenId, s1);
    return r;
  } else if (selection === "s1 (832)") {
    const r = await checkAndMint(tokenId, s2);
    return r;
  } else if (selection === "s1 (4706)") {
    const r = await checkAndMint(tokenId, s3);
    return r;
  } else if (selection === "s1 (6673)") {
    const r = await checkAndMint(tokenId, s4);
    return r;
  } else {
    return console.log("\x1b[31mInvalid selection\x1b[0m");
  }
};
