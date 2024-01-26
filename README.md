# SAAS Demo Frontend

## How to use this repository

The [saas-demo-frontend](https://saas.demo.delta-dao.com) is meant to illustrate how an application could utilize the contracting-provider API to verify the state of contracts negotiated within any Ocean Protocol ecosystem.
It is demonstrated how to make the relevant API calls to get the information you need and which integrations, e.g. a Web3 wallet connection, you might need to realize the full potential.

### Constructing a contracting-provider API call

The code example below illustrates how we can utilize the various library and backend components to get the information we need regarding the contract status for a user and a specific service offering.

```tsx
// First we need to know the did of the service offering
const did = `did:op:123...`

// Then we need to retrieve the address of the wallet that currently is connected with our frontend
// We can leverage the wagmi package here and use the useAccount() hook they provide
const { address } = useAccount()

// Using the address, we can then request a nonce for the user to sign
const nonce = await getNonce(address)
if (!nonce) return

// For the signature itselft, we can again use wagmi and the signMessageAsync() function
const signature = await signMessageAsync({ message: nonce })

// Now that we have the required payload, we can request the subscription / usage status from the contracting provider api
const response = await axios.post(
  `https://contracting.demo.delta-dao.com/contracting/validate`,
  {
    address,
    signature,
    did
  }
)

return response.data
```

> [!NOTE]  
> For more details on how the reference frontend requests the contract status refer to `/src/pages/index.tsx:LL76`

> [!NOTE]  
> You can find the API documentation for the contracting-provider at https://contracting.demo.delta-dao.com/api
