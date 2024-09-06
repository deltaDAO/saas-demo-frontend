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

export interface SelectedAsset {
  did: string
  name: string
  chainId: number
}

interface Subscription {
  asset: SelectedAsset
  hasAccess: boolean
  orderCount: number
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
  const newCancelToken = useCancelToken()

  const [subscription, setSubscription] = useState<Subscription>()
  const [infoText, setInfoText] = useState<string>()
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
        name: undefined,
        chainId: undefined
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

  /********************************/
  /* Contracting Provider Request */
  /********************************/
  const verifySubscription = async (
    address: string,
    did: string,
    chainId: number
  ): Promise<Subscription> => {
    if (!address || !did || !chainId) return

    // Update UI
    setIsLoading(true)
    try {
      // Get a nonce for the user to sign
      const nonce = await getNonce(address)
      if (!nonce) return

      // Ask for the signature via connected wallet
      const signature = await signMessageAsync({ message: nonce })

      // Request subscription / usage status from contracting provider
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CONTRACTING_PROVIDER_URL}/contracting/validate`,
        {
          address,
          signature,
          did,
          chainId
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
      // Update UI
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setInfoText(undefined)
    if (!subscription) return

    let text =
      subscription.orderCount > 0
        ? `The service was ordered ${subscription.orderCount} times with the connected account.`
        : `The service has not been ordered with the connected account.`

    if (
      subscription.latestOrder?.expiryTimestamp > 0 &&
      subscription.latestOrder?.expiryTimestamp * 1000 < Date.now()
    )
      text += `\nYour last subscription expired ${formatDistanceToNow(
        new Date(subscription.latestOrder.expiryTimestamp * 1000),
        { addSuffix: true }
      )}`

    setInfoText(text)
  }, [subscription])

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
              const asset = { ...selectedAsset }
              const subscriptionDetails = await verifySubscription(
                address,
                selectedAsset.did,
                selectedAsset.chainId
              )
              setSubscription({
                ...subscriptionDetails,
                asset
              })
            }}
          >
            {isLoading ? <Loader white /> : <>Verify</>}
          </Button>
        </div>
        <div className={styles.card}>
          <h4>Subscription State</h4>
          {subscription ? (
            <div>
              {subscription.hasAccess === false ? (
                <Alert
                  state="error"
                  text={`There is no active subscription to "${subscription.asset.name}" for this account.`}
                  action={{
                    name: 'Go to Pontus-X',
                    href: `${process.env.NEXT_PUBLIC_PORTAL_URI}/asset/${subscription.asset.did}`
                  }}
                />
              ) : (
                <Alert
                  state="success"
                  text={
                    subscription?.latestOrder?.expiryTimestamp
                      ? `Subscription active! Your subscription will expire in ${formatDistanceToNow(
                          new Date(
                            subscription.latestOrder.expiryTimestamp * 1000
                          )
                        )}.`
                      : 'Your subscription is active and does not have an expiration date.'
                  }
                />
              )}
              {infoText && <Alert state="info" text={infoText} />}
            </div>
          ) : (
            <Alert
              state="warning"
              text={`Connect with MetaMask, select a service and click on the "Verify" button to check the subscription state.`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
