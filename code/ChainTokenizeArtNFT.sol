// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// OpenZeppelin (Remix can fetch these automatically)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OnChainTokenizeArt is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextId = 1;

    // Store the "image" (SVG) directly on-chain per tokenId
    mapping(uint256 => string) private _svgById;

    constructor(address initialOwner)
        ERC721("42 TokenizeArt on Chain", "42ARTC")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string calldata svg) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextId++;
        _safeMint(to, tokenId);
        _svgById[tokenId] = svg;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        // 1) Build the on-chain SVG image data URI
        string memory svg = _svgById[tokenId];
        string memory image = string.concat(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        );

        // 2) Build the JSON metadata (on-chain)
        // Keep it minimal and standards-friendly
        string memory json = string.concat(
            '{"name":"TokenizeArt #', tokenId.toString(),
            '","description":"On-chain metadata + on-chain image (SVG).",',
            '"image":"', image, '",',
            '"attributes":[{"trait_type":"project","value":"TokenizeArt"},{"trait_type":"onchain","value":"true"}]}'
        );

        // 3) Return the JSON as a data URI
        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }
}
