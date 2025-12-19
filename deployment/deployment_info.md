# Deployment Guide – TokenizeArt (42ART)

> How to deploy and verify the TokenizeArt ERC-721 contract on Sepolia, plus references to the current live instance.

## 1) Current deployment (Sepolia)
- **Contract**: `TokenizeArt` (`42ART`)
- **Address**: `0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4`
- **Network**: Ethereum Sepolia testnet
- **Deployer**: `0xC672E4Dc6deD54B283e4598838a4082844fb4949`
- **Creation tx**: `0x4263672fa82533cfda64e0f09548381dd856c92ea90cbe5539301ac46fdf6181`

If you redeploy, replace these values everywhere you reference the contract (README + docs).

## 2) Prerequisites
- MetaMask installed with Sepolia enabled.
- Sepolia ETH for gas (any faucet works).
- Remix IDE: https://remix.ethereum.org/
- Source file: `code/TokenizeArtNFT.sol`
- Compiler version: `0.8.27`.

## 3) Deployment steps (Remix + MetaMask)
1. Open Remix and create `TokenizeArtNFT.sol` under `/contracts`, paste the contents of `code/TokenizeArtNFT.sol`.
2. **Solidity Compiler** tab:
   - Version: `0.8.27`
   - Compile the contract.
3. **Deploy & Run Transactions** tab:
   - Environment: **Injected Provider - MetaMask**
   - Network: **Sepolia**
   - Contract: `TokenizeArt`
   - Constructor argument: `initialOwner` (address that will control minting, e.g., your EOA or a multisig).
4. Click **Deploy**, confirm the transaction in MetaMask, and wait for mining.
5. Copy the deployed address and transaction hash from Remix or Etherscan.

## 4) Verification on Etherscan
1. Open `https://sepolia.etherscan.io/address/<contract_address>`.
2. Go to the **Contract** tab → **Verify and Publish**.
3. Settings:
   - Compiler: `0.8.27`
4. Paste the exact source code from `code/TokenizeArtNFT.sol` (single-file verification).
5. Submit. Once verified, `Read Contract` and `Write Contract` tabs will be available.

## 5) Post-deployment checks
- **Ownership**: In **Read Contract**, call `owner()` to ensure it matches your intended admin.
- **Mint test token**: In **Write Contract**, call `safeMint(to, uri)` using one of the IPFS metadata URIs in `mint/metadata_uri*.txt`.
- **Token tracker**: Confirm the new token appears under the token tracker tab and that `tokenURI(tokenId)` returns the correct URI.

## 6) Troubleshooting
- **Gas estimation failed**: ensure the wallet has Sepolia ETH.
- **Verification mismatch**: compiler version or optimization flag differs from Remix settings.
- **Mint reverted**: only `owner()` can call `safeMint`; confirm you are using the owner account.
- **Metadata not loading**: verify the IPFS CID is pinned and the JSON includes an `image` field.

## 7) Summary
Following the steps above you can reproduce the Sepolia deployment, verify the source on Etherscan, and mint new NFTs using IPFS-hosted metadata. Update the address references whenever you redeploy so evaluators can interact without extra setup.
