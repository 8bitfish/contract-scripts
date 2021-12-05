const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require("dotenv");
dotenv.config();
const mnemonic = process.env.MNEMONIC;
const infuraProjectId = process.env.INFURA_PROJECT_ID;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 5777,
      gas: 6000000,
    },

    rinkeby: {
      provider: () => {
        return new HDWalletProvider(
          mnemonic,
          `https://rinkeby.infura.io/v3/${infuraProjectId}`,
        );
      },
      network_id: 4,
      confirmations: 2,
      skipDryRun: true,
    },

    mainnet: {
      provider: () => {
        return new HDWalletProvider(
          mnemonic,
          `https://mainnet.infura.io/v3/${infuraProjectId}`,
        );
      },
      gas: 3300000,
      gasPrice: 7000000000,
      network_id: 1,
    },

    polygon: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic,
          },
          providerOrUrl: `https://polygon-mainnet.infura.io/v3/${infuraProjectId}`,
        }),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 137,
    },

    mumbai: {
      provider: () => {
        return new HDWalletProvider(
          mnemonic,
          `https://polygon-mumbai.infura.io/v3/${infuraProjectId}`,
        );
      },
      network_id: 80001,
      confirmations: 2,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "0.6.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
  },
  plugins: ["truffle-plugin-verify"],
};
