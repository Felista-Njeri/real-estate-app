import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-deploy";
import "dotenv/config";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "api-key";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const MNEMONIC = process.env.MNEMONIC || "your mnemonic"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0, // First account in the list
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    "lisk-sepolia": {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [WALLET_PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    // base_sepolia: {
    //   url: 'https://sepolia.base.org',
    //   accounts: {
    //     mnemonic: MNEMONIC,
    //   },
    //   verify: {
    //     etherscan: {
    //       apiUrl: "https://api-sepolia.basescan.org",
    //       apiKey: process.env.ETHERSCAN_API_KEY
    //     }
    //   }
    // },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [WALLET_PRIVATE_KEY],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
      accounts: [WALLET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || "",
      "base-sepolia": process.env.BASESCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;
