import { createConfig } from 'wagmi'
import { getDefaultConfig } from 'connectkit'
import { PONTUS_X_TEST } from './chains'

export const wagmiClient = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required
    appName: 'Subscription Verifier',

    // Optional
    chains: [PONTUS_X_TEST]
  })
)

// ConnectKit CSS overrides
// https://docs.family.co/connectkit/theming#theme-variables
export const connectKitTheme = {
  '--ck-font-family': 'var(--font-family-base)',
  '--ck-border-radius': 'var(--border-radius)',
  '--ck-overlay-background': 'var(--background-body-transparent)',
  '--ck-modal-box-shadow': '0 0 20px 20px var(--box-shadow-color)',
  '--ck-body-background': 'var(--background-body)',
  '--ck-body-color': 'var(--font-color-text)',
  '--ck-primary-button-border-radius': 'var(--border-radius)',
  '--ck-primary-button-color': 'var(--font-color-heading)',
  '--ck-primary-button-background': 'var(--background-content)',
  '--ck-primary-button-hover-background': 'var(--background-highlight)',
  '--ck-secondary-button-border-radius': 'var(--border-radius)'
}
