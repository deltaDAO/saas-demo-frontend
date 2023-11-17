import { AppProps } from 'next/app'
import { ReactElement } from 'react'
import App from '../components/App'
import '../styles/global.css'
import { WagmiConfig } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { connectKitTheme, wagmiClient } from '../utils/wallet'

export default function MyApp({
  Component,
  pageProps,
}: AppProps): ReactElement {
  return (
    <WagmiConfig config={wagmiClient}>
      <ConnectKitProvider customTheme={connectKitTheme}>
        <App>
          <Component {...pageProps} />
        </App>{' '}
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
