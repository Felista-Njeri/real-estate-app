import { http, createConfig } from 'wagmi'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'
// import { defineChain } from 'viem';

// const hardhat = defineChain({
//   id: 1337,
//   name: 'Hardhat',
//   network: 'hardhat',
//   nativeCurrency: {
//     name: 'Ether',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ['http://127.0.0.1:8545'],
//     },
//     public: {
//       http: ['http://127.0.0.1:8545'],
//     },
//   },
//   testnet: true,
// });



export const wagmiconfig = createConfig({
  chains: [mainnet, sepolia, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
})