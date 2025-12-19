import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract'
import { fetchMetadataFromUri } from '../utils/metadata'

const defaultMintForm = {
  recipient: '',
  tokenUri: '',
}

export function MintPanel({
  account,
  ready,
  signer,
  provider,
  connect,
  ensureNetwork,
  setStatus,
  onMinted,
}) {
  const [mintForm, setMintForm] = useState(defaultMintForm)
  const [minting, setMinting] = useState(false)
  const [mintResult, setMintResult] = useState(null)

  useEffect(() => {
    if (account && !mintForm.recipient) {
      setMintForm((prev) => ({ ...prev, recipient: account }))
    }
  }, [account, mintForm.recipient])

  const handleMint = async (event) => {
    event.preventDefault()
    setMintResult(null)
    if (!ready) {
      setStatus('No wallet detected.')
      return
    }
    if (!signer || !provider) {
      await connect()
      if (!signer) return
    }
    if (!ensureNetwork()) {
      setStatus('Switch your wallet to Sepolia before minting.')
      return
    }
    const tokenUri = (mintForm.tokenUri || '').trim()
    if (!tokenUri) {
      setStatus('Add a token URI (ipfs/https/data).')
      return
    }
    setMinting(true)
    setStatus('Submitting mint transaction...')
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.safeMint(
        mintForm.recipient || account,
        tokenUri,
      )
      const receipt = await tx.wait()

      const transferLog = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((parsed) => parsed && parsed.name === 'Transfer')
      const mintedTokenId =
        transferLog?.args?.tokenId?.toString?.() ||
        transferLog?.args?.[2]?.toString?.() ||
        null

      const decodedMetadata = await fetchMetadataFromUri(tokenUri)

      const minted = {
        tokenId: mintedTokenId,
        owner: mintForm.recipient || account,
        txHash: receipt.hash,
        uri: tokenUri,
        metadata: decodedMetadata,
      }
      setMintResult(minted)
      onMinted?.(minted)
      setStatus('Minted!')
    } catch (error) {
      console.error(error)
      setStatus(error?.shortMessage || 'Mint failed.')
    } finally {
      setMinting(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="label">Mint inscription</p>
          <h2>Mint with tokenURI (safeMint)</h2>
        </div>
        <span className="chip">safeMint</span>
      </div>
      <form className="form" onSubmit={handleMint}>
        <div className="field">
          <p className="label">Direct safeMint</p>
          <p className="subtle small">
            Provide recipient + tokenURI (data/https/ipfs). Nothing else required.
          </p>
        </div>
        <div className="field">
          <label>Recipient</label>
          <input
            type="text"
            value={mintForm.recipient}
            onChange={(e) =>
              setMintForm((prev) => ({
                ...prev,
                recipient: e.target.value,
              }))
            }
            placeholder="0x... destination address"
            required
          />
        </div>
        <div className="field">
          <label>Token URI</label>
          <textarea
            rows="3"
            value={mintForm.tokenUri}
            onChange={(e) =>
              setMintForm((prev) => ({
                ...prev,
                tokenUri: e.target.value,
              }))
            }
            placeholder="data:application/json;base64,... or https://... or ipfs://..."
            required
          />
          <p className="subtle small">
            safeMint only needs `to` + `tokenURI`. Paste any prepared tokenURI here (on-chain or off-chain).
          </p>
        </div>
        <button className="primary" type="submit" disabled={minting}>
          {minting ? 'Minting...' : 'Mint inscription'}
        </button>
      </form>

      {mintResult && (
        <div className="result">
          <p className="label">Minted</p>
          <p className="value">
            Token ID: {mintResult.tokenId || 'pending (check receipt)'}
          </p>
          <p className="value">
            Tx:{' '}
            <a
              href={`https://sepolia.etherscan.io/tx/${mintResult.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {mintResult.txHash}
            </a>
          </p>
          <p className="value">
            Token URI:{' '}
            <span className="mono">{mintResult.uri}</span>
          </p>
          <details>
            <summary>Metadata preview</summary>
            <pre>{JSON.stringify(mintResult.metadata, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}
