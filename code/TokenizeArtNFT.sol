// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenizeArt is ERC721URIStorage, Ownable {
    uint256 private _nextId = 1;

    constructor(address initialOwner)
        ERC721("42 TokenizeArt", "42ART")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string calldata uri) external onlyOwner {
        uint256 tokenId = _nextId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
