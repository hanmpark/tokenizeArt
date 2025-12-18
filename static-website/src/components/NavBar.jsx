import { shortenAddress } from '../utils/format'

export function NavBar({ ready, currentChainOk, connect, account }) {
  return (
    <header className="nav">
      <div className="brand">
        <span className="badge">tokenize</span>
        <span className="brand-main">Art</span>
      </div>
      <div className="nav-actions">
        <div className="pill">
          <span className="dot" />
          {ready ? 'Wallet ready' : 'No wallet detected'}
        </div>
        <div className={`pill ${currentChainOk ? 'good' : 'warn'}`}>
          {currentChainOk ? 'Sepolia' : 'Switch to Sepolia'}
        </div>
        <button className="ghost" onClick={connect}>
          {account ? shortenAddress(account) : 'Connect wallet'}
        </button>
      </div>
    </header>
  )
}
