// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/*
    TokenizeArt NFT collection.

    - ERC721 with per-token URI storage for flexible metadata hosting.
    - Token IDs auto-increment from 1 to keep IDs small and predictable.
    - Only the contract owner can mint; constructor assigns ownership to `initialOwner`
      (e.g., a deployer EOA or multisig).
*/
contract TokenizeArt is ERC721URIStorage, Ownable {
    // Next token identifier; starts at 1 for cleaner UX.
    uint256 private _nextId = 1;

    /// @param initialOwner Address that will receive ownership and control minting.
    constructor(address initialOwner)
        ERC721("42 TokenizeArt", "42ART")
        Ownable(initialOwner)
    {}

    /// @notice Mint a new token and set its metadata URI in a single transaction.
    /// @param to Recipient address for the newly minted NFT.
    /// @param uri Metadata URI (e.g., IPFS link) bound to the minted token.
    function safeMint(address to, string calldata uri) external onlyOwner {
        uint256 tokenId = _nextId++;
        // Mint the token to the recipient and store its metadata URI.
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
