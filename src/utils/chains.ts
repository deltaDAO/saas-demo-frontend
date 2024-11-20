import { Chain } from 'wagmi'

export const PONTUS_X_TEST = {
  id: 32457,
  name: 'Pontus-X Testnet',
  network: 'pontusx-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EUROe',
    symbol: 'EUROe'
  },
  rpcUrls: {
    public: { http: ['https://rpc.test.pontus-x.eu'] },
    default: { http: ['https://rpc.test.pontus-x.eu'] }
  },
  blockExplorers: {
    default: {
      name: 'Pontus-X Testnet Explorer',
      url: 'https://explorer.pontus-x.eu/pontusx/test'
    }
  }
} as Chain

export const NETWORKS_BY_ID = {
  100: 'GEN-X Testnet',
  32456: 'Pontus-X Devnet',
  32457: 'Pontus-X Testnet'
}
