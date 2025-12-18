import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { NavBar } from './components/NavBar'
import { Hero } from './components/Hero'
import { MintPanel } from './components/MintPanel'
import { InspectPanel } from './components/InspectPanel'
import { TARGET_CHAIN_ID } from './contract'

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [network, setNetwork] = useState(null)
  const [status, setStatus] = useState('')
  const [sessionMints, setSessionMints] = useState([])

  const ready = useMemo(() => Boolean(window.ethereum), [])

  useEffect(() => {
    if (!ready) return
    const handleAccountsChanged = async (accounts) => {
      setAccount(accounts?.[0] || '')
      if (provider) {
        const nextSigner = await provider.getSigner()
        setSigner(nextSigner)
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [ready, provider])

  const connect = useCallback(async () => {
    if (!ready) {
      setStatus('Install MetaMask or a compatible wallet to continue.')
      return
    }
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      const signerInstance = await browserProvider.getSigner()
      const networkInfo = await browserProvider.getNetwork()
      setProvider(browserProvider)
      setSigner(signerInstance)
      setAccount(accounts[0])
      setNetwork(networkInfo)
      if (networkInfo.chainId !== BigInt(TARGET_CHAIN_ID)) {
        setStatus('Connected. Please switch to Sepolia.')
      } else {
        setStatus('Wallet connected to Sepolia.')
      }
    } catch (error) {
      console.error(error)
      setStatus('Wallet connection was cancelled or failed.')
    }
  }, [ready])

  const ensureNetwork = useCallback(
    () => network?.chainId === BigInt(TARGET_CHAIN_ID),
    [network],
  )

  const currentChainOk = ensureNetwork()

  return (
    <div className="page">
      <div className="gradient" aria-hidden />
      <NavBar
        ready={ready}
        currentChainOk={currentChainOk}
        connect={connect}
        account={account}
      />

      <main className="layout">
        <Hero
          connect={connect}
          account={account}
          network={network}
          status={status}
        />

        <section className="grid">
          <MintPanel
            account={account}
            ready={ready}
            signer={signer}
            provider={provider}
            connect={connect}
            ensureNetwork={ensureNetwork}
            setStatus={setStatus}
            onMinted={(minted) => setSessionMints((prev) => [minted, ...prev])}
          />
          <InspectPanel
            ready={ready}
            provider={provider}
            sessionMints={sessionMints}
          />
        </section>
      </main>
    </div>
  )
}

export default App
