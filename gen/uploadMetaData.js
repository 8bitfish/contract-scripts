require("dotenv").config();
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");
const PrismaClientPkg = require("@prisma/client");
const PrismaClient = PrismaClientPkg.PrismaClient;
const generateMetadata = require("./generateMetadata");

const prisma = new PrismaClient();

module.exports = async function ({ tokenId, colors, pattern, p, network }) {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

  const handleFile = async () => {
    const fileStream = fs.createReadStream(`${p}.svg`);

    const options = {
      pinataMetadata: {
        name: `8BF #${tokenId}.svg [${network}]`,
        keyvalues: {
          type: "svg",
          tokenId: tokenId,
        },
      },
    };

    const { IpfsHash } = await pinata.pinFileToIPFS(fileStream, options);
    return {
      imageHash: IpfsHash,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    };
  };

  const handleJSON = async (image) => {
    const data = {
      tokenId,
      image,
      pattern,
      colors,
    };

    const meta = await generateMetadata({ data });

    const options = {
      pinataMetadata: {
        name: `8BF #${tokenId} [${network}]`,
        keyvalues: {
          type: "json",
          tokenId: tokenId,
        },
      },
    };

    await fs.promises.writeFile(`${p}.json`, JSON.stringify(data), (e) => {
      if (e) {
        console.error(e);
      }
    });

    const { IpfsHash } = await pinata.pinJSONToIPFS(meta, options);
    return {
      uriHash: IpfsHash,
      uriUrl: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    };
  };

  const { imageHash, imageUrl } = await handleFile();
  const { uriHash, uriUrl } = await handleJSON(imageUrl);

  await prisma.bitFish.create({
    data: {
      tokenId: tokenId,
      network: network,
      jsonHash: uriHash,
      imageHash: imageHash,
      pattern: pattern,
      primaryColor: colors.primary.base,
      secondaryColor: colors.secondary.base,
    },
  });

  return { uriHash, uriUrl };
};
