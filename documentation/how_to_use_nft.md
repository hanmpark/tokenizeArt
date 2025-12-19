# How to Use the TokenizeArt NFT (42ART)

> Step-by-step guide to view, mint, and verify the 42ART ERC-721 collection on Sepolia.

## 1) Overview & addresses
- **Contract**: `TokenizeArt` (`42ART`)
- **Network**: Sepolia testnet (Ethereum)
- **Address**: `0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4`
- **Owner-only minting**: only the `owner()` account can call `safeMint`.
- **Example minted NFT**: `tokenId 1`, `tokenURI ipfs://bafybeifphj7nxpovxk24ovjqnzjecjwz3jm2qitdexe4rqgzsp2pqyvltu`

If you redeploy, replace the address and tokenURI values in this file.

## 2) Prerequisites
- MetaMask installed and set to **Sepolia**.
- A wallet with some Sepolia ETH for gas.
- IPFS metadata URI ready for minting (use the provided examples in `mint/` or your own pinned JSON).

## 3) Viewing the collection on Etherscan
1. Open `https://sepolia.etherscan.io/address/0x7ceDcd571F8C33DE2b10B41798cc4bA873c57Ae4`.
2. **Contract → Read Contract** to query:
   - `name()`, `symbol()`
   - `owner()`
   - `balanceOf(address)`
   - `ownerOf(tokenId)`
   - `tokenURI(tokenId)`

## 4) Minting a new NFT (owner only)
`safeMint(address to, string uri)` mints a token and sets its metadata URI in one transaction. Only `owner()` can call it.

Steps on Etherscan:
1. Go to **Contract → Write Contract → Connect to Web3**.
2. Expand `safeMint`.
3. Fill fields:
   - `to`: recipient wallet address.
   - `uri`: IPFS metadata URI (e.g., `ipfs://bafkreif7of2nrir4ruzl4j5wkevkxjzmnge2jczoqzugsciu4bvrfoxvfq`).
4. Click **Write** and confirm in MetaMask.
5. After mining, check `tokenURI(newTokenId)` and the **Token tracker** to see the minted NFT.

Tip: token IDs increment from 1 automatically. If tokenId 1 exists, the next mint will create tokenId 2.

## 5) Using the provided metadata samples
- Metadata JSON examples: `mint/42_tokenizeart_1.json`, `mint/42_tokenizeart_2.json`.
- Metadata URIs: `ipfs://bafkreif7of2nrir4ruzl4j5wkevkxjzmnge2jczoqzugsciu4bvrfoxvfq`, `ipfs://bafkreianbtoa72nqv5lraekwa5ynze5a7s64ilmxishvyyjyuxzkkwjafq`.
- Image URIs referenced by the JSON: `ipfs://bafybeifphj7nxpovxk24ovjqnzjecjwz3jm2qitdexe4rqgzsp2pqyvltu`, `ipfs://bafybeiaikusb63neowo76kbzsnkjkx4o2xrrns34gpdzkeddv64jvuy5x4`.

You can mint directly against these metadata URIs or pin your own JSON to IPFS and use that URI.

## 6) Verifying ownership and metadata
- **Who can mint?** Call `owner()` to see the controlling address.
- **Who owns a token?** Call `ownerOf(tokenId)`.
- **What metadata is bound?** Call `tokenURI(tokenId)` and open the returned URI through an IPFS gateway (e.g., `https://ipfs.io/ipfs/<CID>`).
- **Wallet balances**: `balanceOf(address)` shows how many tokens a wallet holds.

## 7) Troubleshooting
- **Mint failed / reverted**: ensure the caller is `owner()`, the URI is non-empty, and you have Sepolia ETH for gas.
- **Metadata not loading**: confirm the CID is pinned and reachable; JSON must include an `image` field for most viewers.
- **Token tracker not updated**: wait for the transaction to confirm and refresh the Etherscan token page.

## 8) Useful references
- Contract source: `code/TokenizeArtNFT.sol`
- Deployment info: `deployment/deployment_info.md`

## 9) Conclusion
You can now view existing 42ART tokens, mint new ones (as the owner), and verify metadata directly from Etherscan. Use the provided IPFS URIs for quick tests or replace them with your own pinned metadata for new artwork.***
