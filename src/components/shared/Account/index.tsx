import { ConnectKitButton } from 'connectkit'
import Button from '../Button'
import Loader from '../Loader'

export default function Account() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, truncatedAddress }) => {
        return (
          <Button style="primary" onClick={show}>
            {!isConnected && isConnecting ? (
              <Loader message="connecting..." white />
            ) : isConnected ? (
              truncatedAddress
            ) : (
              'Connect'
            )}
          </Button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}
