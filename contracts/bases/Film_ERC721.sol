// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {InternetCameraFilm} from "./Film.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {IInternetCameraCollection} from "../interfaces/ICollection.sol";

contract InternetCameraFilmERC721 is
    InternetCameraFilm,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable
{
    uint256 private _counter;
    mapping(uint256 => string) private _data;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        string memory name,
        string memory symbol,
        address creator,
        address collection,
        InternetCameraFilm.Configuration memory config
    ) public initializer {
        if (config.premint > config.maxSupply) revert FilmNotAuthorized();
        __ERC721_init(name, symbol);
        InternetCameraFilm.initialize(collection, config);
        for (uint256 i = 0; i < config.premint; i++) {
            _mint(creator, "");
        }
    }

    function totalSupply() public view returns (uint256) {
        return _counter;
    }

    function mint(string memory ipfsHash) public payable {
        if (!config.mintable) revert FilmNotAuthorized();
        if (msg.value != config.price) revert FilmNotAuthorized();
        if (_counter >= config.maxSupply) revert FilmNotAuthorized();
        _mint(_msgSender(), ipfsHash);
    }

    function _mint(address to, string memory ipfsHash) private {
        _counter++;
        _mint(to, _counter);
        _data[_counter] = ipfsHash;
    }

    function use(uint256 tokenId, string memory ipfsHash) public checkUsable {
        if (ownerOf(tokenId) != _msgSender()) revert FilmNotAuthorized();
        _burn(tokenId);
        IInternetCameraCollection(collection).post(
            _msgSender(),
            tokenId,
            ipfsHash
        );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }
}
