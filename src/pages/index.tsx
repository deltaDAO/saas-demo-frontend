import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useSignMessage } from 'wagmi'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import Account from '../components/shared/Account'
import Button from '../components/shared/Button'
import Alert from '../components/shared/Alert'
import Loader from '../components/shared/Loader'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'

// dynamically import the component without ssr to avoid Hydration error displaying the svg
const Card = dynamic(() => import('../components/shared/Card'), { ssr: false })

interface Subscription {
  hasAccess: boolean
  latestOrder?: {
    id: string
    block: number
    createdTimestamp: number
    consumer: string
    datatoken: string
    expiryTimestamp: number
  }
}

export default function Home(): ReactElement {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [subscription, setSubscription] = useState<Subscription>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!address) setSubscription(undefined)
  }, [address])

  const getNonce = async (address: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CONTRACTING_PROVIDER_URL}/user/${address}/nonce`
      )

      if (response.status !== 200) throw new Error()

      return response.data
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const verifySubscription = async (
    address: string,
    did: string
  ): Promise<Subscription> => {
    if (!address || !did) return

    setIsLoading(true)
    try {
      const nonce = await getNonce(address)
      if (!nonce) return

      const signature = await signMessageAsync({ message: nonce })
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CONTRACTING_PROVIDER_URL}/contracting/validate`,
        {
          address,
          signature,
          did,
        }
      )

      return response.data
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <img src="/pontus-x.svg" alt="Pontus-X logo" className={styles.logo} />
      <h1 className={styles.title}>Subscription Verifier</h1>
      <div className={styles.grid}>
        <Card completed={!!address}>
          <>
            <h4>Step1: Connect with Metamask</h4>
            <Account />
          </>
        </Card>
        <Card completed={!!subscription}>
          <>
            <h4>Step2: Verify Subscription State</h4>
            <Button
              style="primary"
              disabled={!address}
              onClick={async () => {
                const subscriptionDetails = await verifySubscription(
                  address,
                  process.env.NEXT_PUBLIC_ASSET_DID
                )
                setSubscription(subscriptionDetails)
              }}
            >
              {isLoading ? <Loader white /> : <>Verify</>}
            </Button>
          </>
        </Card>
        <Card>
          <>
            <h4>Subscription State:</h4>
            <div>
              {subscription?.hasAccess &&
              subscription?.latestOrder?.expiryTimestamp ? (
                <Alert
                  state="success"
                  text={`Your subscription will expire in ${formatDistanceToNow(
                    new Date(subscription.latestOrder.expiryTimestamp * 1000)
                  )}`}
                />
              ) : subscription?.hasAccess === false ? (
                <Alert
                  state="error"
                  text="There is no active subscription for this account."
                  action={{
                    name: 'Go to Pontus-X',
                    href: `https://pontus-x.eu/asset/${process.env.NEXT_PUBLIC_ASSET_DID}`,
                  }}
                />
              ) : (
                <Alert
                  state="info"
                  text={`Connect with MetaMask and click on the "Verify" button to check the subscription state.`}
                />
              )}
            </div>
          </>
        </Card>
      </div>
    </div>
  )
}
