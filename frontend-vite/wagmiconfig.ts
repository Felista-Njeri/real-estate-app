import { http, createConfig } from 'wagmi'
import { liskSepolia, mainnet, sepolia } from 'wagmi/chains'

export const wagmiconfig = createConfig({
  chains: [mainnet, sepolia, liskSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [liskSepolia.id]: http(),
  },
})