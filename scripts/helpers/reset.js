require("dotenv").config();
const {MultiSelect} = require("enquirer");
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");
const PrismaClientPkg = require("@prisma/client");
const {PrismaClient} = PrismaClientPkg;
const prisma = new PrismaClient();
const network = require("minimist")(process.argv.slice(2))._[0];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

async function main() {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

  const resetPinata = async () => {
    const networkRecords = await prisma.bitFish.findMany({
      where: {
        network: network,
      },
      select: {
        tokenId: true,
        jsonHash: true,
        imageHash: true,
      },
    });

    let loader = loadingAnimation(
      `Removing ${networkRecords.length * 2} pins from Pinata`,
    );

    for (let i = 0; i < networkRecords.length; i++) {
      const {tokenId, jsonHash, imageHash} = networkRecords[i];
      if (
        jsonHash === process.env.SPECIAL_1_HASH ||
        jsonHash === process.env.SPECIAL_2_HASH ||
        jsonHash === process.env.SPECIAL_3_HASH ||
        jsonHash === process.env.SPECIAL_4_HASH
      ) {
        console.log(
          `\n\x1b[2m▶ Skipping metadata deletion for ${tokenId} (special token)`,
        );
      } else {
        await delay(1000);
        // console.log(`Removing pin for token ${tokenId}`);
        try {
          await pinata.unpin(jsonHash);
        } catch (e) {
          console.log(e);
        }
        try {
          await pinata.unpin(imageHash);
        } catch (e) {
          console.log(e);
        }
      }
    }
    clearInterval(loader);
    console.log(
      `\n\x1b[32m✔ Removed ${
        networkRecords.length * 2
      } pins associated with network "${network}"`,
    );
  };

  const resetAssets = async () => {
    const recordCount = await prisma.bitFish.findMany({
      where: {
        network: network,
      },
      select: {
        tokenId: true,
      },
    });

    let loader = loadingAnimation(
      `Deleting ${recordCount.length} static assets`,
    );

    recordCount.forEach(async (record) => {
      await fs.promises.rmdir(
        `./gen/assets/generated/${network}/token ${record.tokenId}`,
        {
          recursive: true,
        },
      );
    });
    clearInterval(loader);
    console.log(
      `\x1b[32m✔ Removed ${recordCount.length} static asset(s) associated with network "${network}"`,
    );
  };

  const resetPrisma = async () => {
    if (fs.readdirSync(`./gen/assets/generated/${network}`).length !== 0) {
      await resetAssets();
    }

    let loader = loadingAnimation(
      `Deleting all record entries associated with "${network}"`,
    );
    const {count} = await prisma.bitFish.deleteMany({
      where: {
        network: network,
      },
    });
    clearInterval(loader);
    console.log(`\x1b[32m✔ Deleted ${count} records matching "${network}"`);
  };

  const resetOptions = await new MultiSelect({
    name: "reset options",
    message: "What would you like to reset? ",
    choices: [
      {name: "pinata", value: "p"},
      {name: "database", value: "db"},
      {name: "generated assets", value: "ga"},
      {name: "everything", value: "*"},
    ],
  }).run();

  if (resetOptions.includes("pinata")) {
    await resetPinata();
  }

  if (resetOptions.includes("generated assets")) {
    await resetAssets();
  }

  if (resetOptions.includes("database")) {
    await resetPrisma();
  }

  if (resetOptions.includes("everything")) {
    await resetPinata();
    await resetPrisma();
  }
}
main();
