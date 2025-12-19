import { CONTRACT_ADDRESS } from '../contract'

export function Hero({ connect, account, network, status }) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">On-chain inscriptions</p>
        <h1>42 TokenizeArt</h1>
        <p className="lede">
          Deployed on Sepolia at
          <code>{CONTRACT_ADDRESS}</code>.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={connect}>
            {account ? 'Wallet connected' : 'Connect to mint'}
          </button>
          <a
            className="outline"
            href="https://sepolia.etherscan.io/address/0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4"
            target="_blank"
            rel="noreferrer"
          >
            View contract
          </a>
        </div>
      </div>
      <div className="panel stats">
        <div>
          <p className="label">Wallet</p>
          <p className="value address">{account || 'Not connected'}</p>
        </div>
        <div>
          <p className="label">Network</p>
          <p className="value">
            {network
              ? `${network?.name || 'Unknown'} (${network?.chainId})`
              : 'Detecting...'}
          </p>
        </div>
        <div>
          <p className="label">Mint status</p>
          <p className="value subtle">{status || 'Idle'}</p>
        </div>
      </div>
    </section>
  )
}
