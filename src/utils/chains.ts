import { Chain } from 'wagmi'

export const genx = {
  id: 100,
  name: 'GEN-X Testnet',
  network: 'genx',
  nativeCurrency: {
    decimals: 18,
    name: 'GX',
    symbol: 'GX'
  },
  rpcUrls: {
    public: { http: ['https://rpc.genx.minimal-gaia-x.eu'] },
    default: { http: ['https://rpc.genx.minimal-gaia-x.eu'] }
  },
  blockExplorers: {
    default: {
      name: 'GEN-X Testnet Explorer',
      url: 'https://explorer.pontus-x.eu'
    }
  }
} as Chain

export const NETWORKS_BY_ID = {
  100: 'GEN-X Testnet',
  32456: 'Pontus-X Devnet',
  32457: 'Pontus-X Testnet'
}
