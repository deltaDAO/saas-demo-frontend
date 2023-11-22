import { ReactElement, useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'
import { useAccount, useSignMessage } from 'wagmi'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import Account from '../components/shared/Account'
import Button from '../components/shared/Button'
import Alert from '../components/shared/Alert'
import Loader from '../components/shared/Loader'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'
import { useCancelToken } from '../hooks/useCancelToken'
import { getSaasAssets } from '../utils/aquarius'
import { Asset } from '@oceanprotocol/lib'
import SaasServiceListSelection from '../components/Home/SaasServiceListSelector'

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

export interface SelectedAsset {
  did: string
  name: string
}

export default function Home(): ReactElement {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const newCancelToken = useCancelToken()

  const [subscription, setSubscription] = useState<Subscription>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [saasAssetsList, setSaasAssetsList] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>()

  const querySaasAssetsList = useCallback(async () => {
    const list = await getSaasAssets(newCancelToken())
    setSaasAssetsList(list)
  }, [getSaasAssets])

  useEffect(() => {
    querySaasAssetsList()
  }, [querySaasAssetsList])

  useEffect(() => {
    if (!address) {
      setSelectedAsset({
        did: undefined,
        name: undefined
      })
      setSubscription(undefined)
    }
  }, [address])

  const getNonce = async (address: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CONTRACTING_PROVIDER_URL}/user/${address}/nonce`
      )

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
          did
        }
      )

      return response.data
    } catch (error) {
      if ([401, 404].includes(error?.response?.status)) {
        return error.response.data
      }

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
        <div className={styles.card}>
          <h4>Connect your Account</h4>
          <Account />
        </div>
        <div className={styles.card}>
          <h4>Select and Verify</h4>
          <SaasServiceListSelection
            assets={saasAssetsList}
            setSelectedAsset={setSelectedAsset}
            disabled={isLoading || !address}
          />
          <Button
            style="primary"
            disabled={!address || isLoading || !selectedAsset}
            onClick={async () => {
              const subscriptionDetails = await verifySubscription(
                address,
                selectedAsset.did
              )
              setSubscription(subscriptionDetails)
            }}
          >
            {isLoading ? <Loader white /> : <>Verify</>}
          </Button>
        </div>
        <div className={styles.card}>
          <h4>Subscription State</h4>
          <div>
            {subscription?.hasAccess ? (
              <Alert
                state="success"
                text={
                  subscription?.latestOrder?.expiryTimestamp
                    ? `Your subscription will expire in ${formatDistanceToNow(
                        new Date(
                          subscription.latestOrder.expiryTimestamp * 1000
                        )
                      )}.`
                    : 'Your subscription is active and does not have an expiration date.'
                }
              />
            ) : subscription?.hasAccess === false ? (
              <Alert
                state="error"
                text={`There is no active subscription to "${selectedAsset.name}" for this account.`}
                action={{
                  name: 'Go to Pontus-X',
                  href: `${process.env.NEXT_PUBLIC_PORTAL_URI}/asset/${selectedAsset.did}`
                }}
              />
            ) : (
              <Alert
                state="info"
                text={`Connect with MetaMask, select a service and click on the "Verify" button to check the subscription state.`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
