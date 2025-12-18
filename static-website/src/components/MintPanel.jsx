import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract'
import { encodeMetadataToDataUri } from '../utils/metadata'

const defaultMintForm = {
  recipient: '',
  name: '',
  description: '',
  externalUrl: '',
  imageFile: null,
}

const MAX_FILE_BYTES = 80_000 // ~80 KB raw file size guard to avoid huge on-chain payloads

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

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

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
    if (!mintForm.imageFile) {
      setStatus('Add an image to inscribe on-chain.')
      return
    }
    if (mintForm.imageFile.size > MAX_FILE_BYTES) {
      setStatus('Image too large; use a smaller file (<80 KB) to fit in the on-chain URI.')
      return
    }
    setMinting(true)
    setStatus('Encoding metadata...')
    try {
      const imageData = await fileToDataUrl(mintForm.imageFile)
      const metadata = {
        name: mintForm.name || 'tokenizeArt inscription',
        description:
          mintForm.description ||
          'An on-chain inscription generated via tokenizeArt.',
        image: imageData,
        external_url: mintForm.externalUrl || undefined,
        created_by: account,
        timestamp: new Date().toISOString(),
      }

      const tokenUri = encodeMetadataToDataUri(metadata)

      setStatus('Submitting mint transaction...')
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

      const minted = {
        tokenId: mintedTokenId,
        owner: mintForm.recipient || account,
        txHash: receipt.hash,
        uri: tokenUri,
        metadata,
      }
      setMintResult(minted)
      onMinted?.(minted)
      setStatus('Minted on-chain!')
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
          <h2>Store metadata + image on-chain</h2>
        </div>
        <span className="chip">safeMint</span>
      </div>
      <form className="form" onSubmit={handleMint}>
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
        <div className="field-row">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={mintForm.name}
              onChange={(e) =>
                setMintForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Title for your NFT"
            />
          </div>
          <div className="field">
            <label>External link (optional)</label>
            <input
              type="url"
              value={mintForm.externalUrl}
              onChange={(e) =>
                setMintForm((prev) => ({
                  ...prev,
                  externalUrl: e.target.value,
                }))
              }
              placeholder="https://"
            />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            rows="3"
            value={mintForm.description}
            onChange={(e) =>
              setMintForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="What is this inscription about?"
          />
        </div>
        <div className="field upload">
          <label>Image to inscribe</label>
          <div className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setMintForm((prev) => ({
                  ...prev,
                  imageFile: e.target.files?.[0] || null,
                }))
              }
              required
            />
            <p className="subtle">
              File is encoded to base64 and embedded directly in the token URI.
            </p>
            {mintForm.imageFile && (
              <p className="selected">
                Selected: {mintForm.imageFile.name} (
                {Math.round(mintForm.imageFile.size / 1024)} KB)
              </p>
            )}
            <p className="subtle small">
              Tip: keep images under 80 KB (e.g. 256–512px) to stay within gas limits.
            </p>
          </div>
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
          <details>
            <summary>Metadata preview</summary>
            <pre>{JSON.stringify(mintResult.metadata, null, 2)}</pre>
            {mintResult.metadata?.image && (
              <img
                src={mintResult.metadata.image}
                alt={mintResult.metadata.name}
                className="preview"
              />
            )}
          </details>
        </div>
      )}
    </div>
  )
}
