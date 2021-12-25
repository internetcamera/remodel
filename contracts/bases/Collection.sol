// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {IInternetCameraCollection} from "../interfaces/ICollection.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract InternetCameraCollection is
    IInternetCameraCollection,
    OwnableUpgradeable,
    ERC721Upgradeable
{
    address public filmAddress;
    uint256 private _counter;
    mapping(uint256 => string) private data;

    modifier onlyFilmContract() {
        if (msg.sender != filmAddress) revert NotAuthorized();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        address film,
        address creator,
        string memory name,
        string memory symbol
    ) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init_unchained();
        transferOwnership(creator);
        filmAddress = film;
    }

    function post(
        address creator,
        uint256 tokenId,
        string memory ipfsHash
    ) public onlyFilmContract {
        _counter++;
        _mint(creator, tokenId);
        data[tokenId] = ipfsHash;
        emit PostCreated(tokenId, ipfsHash);
    }

    function remove(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        delete data[tokenId];
        emit PostRemoved(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _counter;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return string(abi.encodePacked("ipfs://", data[tokenId]));
    }
}
