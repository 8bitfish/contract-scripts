// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BitFish is ERC721, Ownable {
    using SafeMath for uint256;
    using Strings for string;

    uint256 price;

    constructor() public ERC721("8BitFish", "8BF") {}

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashes;

    uint256[] public tokens;

    function mint(string memory hash, string memory _tokenURI)
        public
        payable
        onlyOwner
        returns (uint256)
    {
        uint256 supply = totalSupply();
        require(supply < 8000, "Exceeds maximum 8BitFish supply");
        require(hashes[hash] != 1);
        hashes[hash] = 1;
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        tokens.push(tokenId);
        return tokenId;
    }

    function withdrawFunds() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
