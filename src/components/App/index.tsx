import { ReactElement } from 'react'
import styles from './index.module.css'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'

export default function App({
  children,
}: {
  children: ReactElement
}): ReactElement {
  return (
    <div className={styles.container}>
      <Head>
        <title>SAAS Verifier</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}></header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <a
          href="https://delta-dao.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img
            src="/deltaDAO_Logo_small_RGB_white.svg"
            alt="Vercel"
            className={styles.logo}
          />
        </a>
      </footer>
      <ToastContainer position="bottom-right" newestOnTop />
    </div>
  )
}
