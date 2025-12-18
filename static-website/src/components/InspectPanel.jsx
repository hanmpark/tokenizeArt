import { useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract'
import { dataUriToJson } from '../utils/metadata'

export function InspectPanel({ ready, provider, sessionMints }) {
  const [inspectId, setInspectId] = useState('')
  const [inspection, setInspection] = useState(null)
  const [inspectionLoading, setInspectionLoading] = useState(false)
  const [inspectionError, setInspectionError] = useState('')

  const handleInspect = async (event) => {
    event.preventDefault()
    setInspection(null)
    setInspectionError('')
    if (!inspectId) return
    if (!ready) {
      setInspectionError('Connect a wallet to read from the contract.')
      return
    }
    try {
      setInspectionLoading(true)
      const activeProvider =
        provider || new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        activeProvider,
      )
      const [ownerOf, uri] = await Promise.all([
        contract.ownerOf(inspectId),
        contract.tokenURI(inspectId),
      ])
      const metadata = dataUriToJson(uri)
      setInspection({
        tokenId: inspectId,
        owner: ownerOf,
        uri,
        metadata,
      })
    } catch (error) {
      console.error(error)
      setInspectionError(error?.shortMessage || 'Lookup failed.')
    } finally {
      setInspectionLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="label">Inspect inscription</p>
          <h2>Pull on-chain metadata</h2>
        </div>
        <span className="chip secondary">tokenURI</span>
      </div>
      <form className="form" onSubmit={handleInspect}>
        <div className="field">
          <label>Token ID</label>
          <input
            type="number"
            min="0"
            value={inspectId}
            onChange={(e) => setInspectId(e.target.value)}
            placeholder="Enter a tokenId"
            required
          />
        </div>
        <button type="submit" className="outline" disabled={inspectionLoading}>
          {inspectionLoading ? 'Fetching...' : 'Load metadata'}
        </button>
      </form>

      {inspectionError && (
        <p className="error">Lookup failed: {inspectionError}</p>
      )}
      {inspection && (
        <div className="result">
          <p className="label">Owner</p>
          <p className="value">{inspection.owner || 'Unknown'}</p>
          <p className="label">Token URI</p>
          <p className="value uri">{inspection.uri}</p>
          {inspection.metadata && (
            <>
              <p className="label">Metadata</p>
              <pre>{JSON.stringify(inspection.metadata, null, 2)}</pre>
              {inspection.metadata.image && (
                <img
                  src={inspection.metadata.image}
                  alt={inspection.metadata.name}
                  className="preview"
                />
              )}
            </>
          )}
        </div>
      )}

      {sessionMints.length > 0 && (
        <div className="result list">
          <p className="label">Mints this session</p>
          <div className="tokens">
            {sessionMints.map((mint) => (
              <div className="token-card" key={mint.txHash}>
                <p className="value">
                  #{mint.tokenId || 'pending'} {mint.metadata?.name || 'Untitled'}
                </p>
                <p className="subtle small">{mint.txHash}</p>
                <button
                  className="link"
                  onClick={() => {
                    setInspectId(mint.tokenId || '')
                    setInspection(mint)
                  }}
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
