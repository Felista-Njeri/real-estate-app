import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "api-key"
// const SEPOLIA_ETHERSCAN_API_KEY = process.env.SEPOLIA_ETHERSCAN_API_KEY || "api-key"

const config: HardhatUserConfig = {
  solidity: "0.8.28",
    networks: {
    "lisk-sepolia": {
      url: 'https://rpc.sepolia-api.lisk.com',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
        sepolia: process.env.ETHERSCAN_API_KEY || "",
        "lisk-sepolia": "123"
    },
    customChains: [
      {
        network: "lisk-sepolia",
          chainId: 4202,
          urls: {
              apiURL: "https://sepolia-blockscout.lisk.com/api",
              browserURL: "https://sepolia-blockscout.lisk.com",
          },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;