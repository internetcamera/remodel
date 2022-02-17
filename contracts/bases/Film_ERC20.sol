// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {InternetCameraFilm} from "./Film.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {IInternetCameraCollection} from "../interfaces/ICollection.sol";

contract InternetCameraFilmERC20 is
    InternetCameraFilm,
    OwnableUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
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

        __ERC20_init(name, symbol);
        __Ownable_init_unchained();
        __InternetCameraFilm_init(collection, config);
        transferOwnership(creator);

        if (config.premint > 0) _mint(creator, config.premint * 10**decimals());
    }

    function mint(uint256 amount) public payable {
        if (!config.mintable) revert FilmNotAuthorized();
        if (msg.value != config.price * amount) revert FilmNotAuthorized();
        if (
            totalSupply() + (amount * 10**decimals()) >
            (config.maxSupply * 10**decimals())
        ) revert FilmNotAuthorized();
        _mint(_msgSender(), amount * 10**decimals());
    }

    function use(string memory ipfsHash) public {
        _burn(_msgSender(), 1 * 10**decimals());
        uint256 tokenId = IInternetCameraCollection(collection).totalSupply() +
            1;
        IInternetCameraCollection(collection).post(
            _msgSender(),
            tokenId,
            ipfsHash
        );
    }
}
