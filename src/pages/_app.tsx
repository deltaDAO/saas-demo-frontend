import { AppProps } from 'next/app'
import { ReactElement } from 'react'
import App from '../components/App'
import '../styles/global.css'

export default function MyApp({
  Component,
  pageProps,
}: AppProps): ReactElement {
  return (
    <App>
      <Component {...pageProps} />
    </App>
  )
}
