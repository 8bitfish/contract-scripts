const fs = require("fs");
const PrismaClientPkg = require("@prisma/client");
const PrismaClient = PrismaClientPkg.PrismaClient;
const getShades = require("./utils/shades");
const p = require("./assets/patterns/patternExport");
const uploadMetaData = require("./uploadMetaData");

const prisma = new PrismaClient();

const getFish = async (network) => {
  const getColor = () => {
    const hex = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    if (hex.length < 7) {
      return getColor();
    }
    return hex;
  };

  const { primary, secondary } = getShades([getColor(), getColor()]);
  const keys = Object.keys(p);
  const pattern = keys[Math.floor(Math.random() * keys.length)];
  const existingRecords = await prisma.bitFish.count({
    where: {
      primaryColor: primary.base,
      secondaryColor: secondary.base,
      pattern,
      network: network,
    },
  });

  if (existingRecords === 0)
    return {
      svg: p[pattern]({ primary, secondary }),
      pattern,
      colors: { primary, secondary },
    };

  return getFish();
};

module.exports = async function generateFish(tokenId, network) {
  const existingToken = await prisma.bitFish.findFirst({
    where: {
      tokenId: tokenId,
      network: network,
    },
  });

  if (existingToken !== null) {
    console.log(
      `\x1b[31mTokenId of ${tokenId} already exists on ${network}\x1b[0m`,
    );
    throw new Error("Token already exists");
  }

  const { svg, pattern, colors } = await getFish(network);

  const p = `./gen/assets/generated/${network}/token ${tokenId}/#${tokenId}`;

  await fs.promises.mkdir(
    `./gen/assets/generated/${network}/token ${tokenId}/`,
  );

  await fs.promises.writeFile(`${p}.svg`, svg, (err) => {
    if (err) throw err;
  });

  const { uriHash, uriUrl } = await uploadMetaData({
    tokenId,
    colors,
    pattern,
    p,
    network,
  });
  return { uriHash, uriUrl };
};
