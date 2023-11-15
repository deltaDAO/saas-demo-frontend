import { createConfig } from 'wagmi'
import { getDefaultConfig } from 'connectkit'
import { genx } from './chains'

export const wagmiClient = createConfig(
  getDefaultConfig({
    // Required API Keys
    infuraId: process.env.INFURA_ID,
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,

    // Required
    appName: 'SAAS Verifier',

    // Optional
    chains: [genx],
  })
)
