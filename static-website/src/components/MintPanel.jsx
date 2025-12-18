import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract'
import { dataUriToJson, encodeMetadataToDataUri } from '../utils/metadata'

const defaultMintForm = {
  recipient: '',
  tokenUri: '',
}

const defaultMetadataHelper = {
  name: '',
  description: '',
  externalUrl: '',
  imageFile: null,
  imageUrl: '',
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
  const [metadataForm, setMetadataForm] = useState(defaultMetadataHelper)
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

  const buildTokenUriFromMetadata = async () => {
    setStatus('Encoding metadata...')
    try {
      const imageData = metadataForm.imageFile
        ? await fileToDataUrl(metadataForm.imageFile)
        : null
      const imageField =
        imageData ||
        (metadataForm.imageUrl && metadataForm.imageUrl.trim().length > 0
          ? metadataForm.imageUrl.trim()
          : undefined)

      const metadata = {
        name: metadataForm.name || 'tokenizeArt inscription',
        description:
          metadataForm.description ||
          'An on-chain inscription generated via tokenizeArt.',
        image: imageField,
        external_url: metadataForm.externalUrl || undefined,
        created_by: account,
        timestamp: new Date().toISOString(),
      }

      const tokenUri = encodeMetadataToDataUri(metadata)
      setMintForm((prev) => ({ ...prev, tokenUri }))
      setStatus('Token URI generated from metadata helper.')
    } catch (error) {
      console.error(error)
      setStatus('Failed to encode metadata to a token URI.')
    }
  }

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
      setStatus('Add a token URI (paste one or generate it from metadata).')
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

      const decodedMetadata = dataUriToJson(tokenUri)

      const minted = {
        tokenId: mintedTokenId,
        owner: mintForm.recipient || account,
        txHash: receipt.hash,
        uri: tokenUri,
        metadata: decodedMetadata,
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
        <details className="upload-box">
          <summary>Need to build an on-chain inscription? (optional helper)</summary>
          <p className="subtle small">
            Fill metadata below and click “Generate tokenURI”. The field above will be populated with a
            `data:application/json;base64,...` URI that embeds everything (and can be minted immediately).
          </p>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={metadataForm.name}
              onChange={(e) =>
                setMetadataForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Title for your NFT"
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows="3"
              value={metadataForm.description}
              onChange={(e) =>
                setMetadataForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What is this inscription about?"
            />
          </div>
          <div className="field">
            <label>External link (optional)</label>
            <input
              type="url"
              value={metadataForm.externalUrl}
              onChange={(e) =>
                setMetadataForm((prev) => ({
                  ...prev,
                  externalUrl: e.target.value,
                }))
              }
              placeholder="https://"
            />
          </div>
          <div className="field upload">
            <label>Image (optional)</label>
            <input
              type="url"
              value={metadataForm.imageUrl}
              onChange={(e) =>
                setMetadataForm((prev) => ({
                  ...prev,
                  imageUrl: e.target.value,
                }))
              }
              placeholder="https://... or ipfs://..."
            />
            <div className="upload-box">
              <p className="subtle small">Or upload to embed directly on-chain:</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setMetadataForm((prev) => ({
                    ...prev,
                    imageFile: e.target.files?.[0] || null,
                  }))
                }
              />
              <p className="subtle">
                File is encoded to base64 and embedded directly in the token URI.
              </p>
              {metadataForm.imageFile && (
                <p className="selected">
                  Selected: {metadataForm.imageFile.name} (
                  {Math.round(metadataForm.imageFile.size / 1024)} KB)
                </p>
              )}
              <p className="subtle small">
                Tip: larger images mean bigger on-chain payloads and gas costs.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="outline"
            onClick={buildTokenUriFromMetadata}
            disabled={minting}
          >
            Generate tokenURI and fill above
          </button>
        </details>
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
