# TokenizeArt – 42ART NFT Collection

> ERC-721 collection for the 42 “TokenizeArt” subject. Owner-only minting, on-chain metadata URIs, deployed on Sepolia.

## 📌 Overview

This project mirrors the Tokenizer ERC-20 work but for NFTs. It ships a single ERC-721 contract that:
- Stores per-token metadata URIs (IPFS-friendly) via `ERC721URIStorage`.
- Auto-increments token IDs starting at 1 for cleaner UX.
- Restricts minting to the contract owner (constructor assigns ownership to a provided address, e.g., a multisig or deployer).

### Current Sepolia deployment
- **Network**: Sepolia testnet (Ethereum)
- **Contract**: `TokenizeArt` (`42ART`)
- **Address**: `0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4`
- **Deployer**: `0xC672E4Dc6deD54B283e4598838a4082844fb4949`
- **Creation tx**: `0x4263672fa82533cfda64e0f09548381dd856c92ea90cbe5539301ac46fdf6181`

### Example minted token
- **tokenId**: `1`
- **tokenURI**: `ipfs://bafybeifphj7nxpovxk24ovjqnzjecjwz3jm2qitdexe4rqgzsp2pqyvltu`
- **Mint tx**: `0x4e8cbffdfede5a38756c280d0137e444631a2fb00c80486d922a3191aff39468`

If you redeploy, update the addresses and tx hashes here and in the docs.

## 🏗 Project structure

```
project-root/
├── README.md                        # High-level overview
├── code/
│   └── TokenizeArtNFT.sol           # ERC-721 contract (owner-only mint, URI storage)
├── deployment/
│   └── deployment_info.md           # Network, address, deploy/verify steps
├── documentation/
│   └── how_to_use_nft.md            # Detailed interaction + minting guide
├── mint/                            # IPFS metadata + sample mint records
│   ├── 42_tokenizeart_1.json
│   ├── 42_tokenizeart_2.json
│   ├── image_uri.txt / image_uri_1.txt
│   ├── metadata_uri.txt / metadata_uri_1.txt
│   └── mint_info.md
└── static-website/                  # Frontend (Vite) to showcase the collection
```

## 🔍 Contract behavior (TokenizeArtNFT.sol)
- Standard ERC-721 built on OpenZeppelin `ERC721` + `ERC721URIStorage`.
- Owner-only `safeMint(address to, string uri)` mints and sets metadata in one call.
- Token IDs start at 1 and increment automatically.
- Ownership is assigned to the `initialOwner` constructor argument (use a multisig or deployer EOA).

## 🚀 How to interact (quick view)
- View on Etherscan: `https://sepolia.etherscan.io/address/0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4`
- **Read**: `name`, `symbol`, `owner()`, `ownerOf(tokenId)`, `tokenURI(tokenId)`, `balanceOf(account)`.
- **Write (owner only)**: `safeMint(to, uri)` using an IPFS metadata URI (see `mint/metadata_uri*.txt`).
- Token trackers and NFT images appear automatically on Etherscan once metadata is reachable.

Detailed steps (with screenshots and parameters) are in `documentation/how_to_use_nft.md`.

## 🧾 Metadata references
- Sample metadata JSON: `mint/42_tokenizeart_1.json`, `mint/42_tokenizeart_2.json`
- Sample metadata URIs: `ipfs://bafkreif7of2nrir4ruzl4j5wkevkxjzmnge2jczoqzugsciu4bvrfoxvfq`, `ipfs://bafkreianbtoa72nqv5lraekwa5ynze5a7s64ilmxishvyyjyuxzkkwjafq`
- Sample image URIs: `ipfs://bafybeifphj7nxpovxk24ovjqnzjecjwz3jm2qitdexe4rqgzsp2pqyvltu`, `ipfs://bafybeiaikusb63neowo76kbzsnkjkx4o2xrrns34gpdzkeddv64jvuy5x4`

## 🛠 Deployment highlights
- Deploy with Remix + MetaMask on Sepolia.
- Constructor parameter: `initialOwner` (use the address that should control minting).
- Verify on Etherscan with compiler `0.8.27` and matching optimization settings.
- After deployment, import the contract into MetaMask/portfolio viewers or interact through Etherscan’s Write tab to mint.

Step-by-step deployment is in `deployment/deployment_info.md`.

## 🎯 Design choices (and why)
- **Sepolia testnet**: stable public chain with cheap gas and good explorer support; ideal for evaluators to verify on-chain state without cost.
- **Remix + MetaMask**: browser-first workflow with no local toolchain required, matching the subject expectations and reducing setup friction.
- **OpenZeppelin ERC-721**: audited, standards-compliant base with URI storage extension to safely bind IPFS metadata.
- **Owner-only minting**: ensures supply control; ownership can be an EOA or multisig, preventing unauthorized issuance.
- **Incremental IDs from 1**: cleaner UX on explorers and in UIs than zero-based or random IDs.
- **IPFS metadata + samples**: decentralizes media/metadata and gives evaluators ready-to-mint URIs so they can test without hosting files themselves.
- **Etherscan verification**: makes the source transparent and enables read/write interaction directly from the explorer.

This repository shows how to launch a minimal but production-aligned ERC-721 collection on a public testnet, ready for UI integration or further expansion.
