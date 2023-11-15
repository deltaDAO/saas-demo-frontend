import { createConfig } from 'wagmi'
import { getDefaultConfig } from 'connectkit'
import { genx } from './chains'

export const wagmiClient = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,

    // Required
    appName: 'SAAS Verifier',

    // Optional
    chains: [genx],
  })
)
