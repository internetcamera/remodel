// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {IInternetCameraFilm} from "../interfaces/IFilm.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract InternetCameraFilm is
    IInternetCameraFilm,
    OwnableUpgradeable
{
    address public collection;
    IInternetCameraFilm.Configuration public config;

    modifier onlyCollectionContract() {
        if (msg.sender != address(collection)) revert FilmNotAuthorized();
        _;
    }

    modifier checkUsable() {
        if (config.startTime > 0 && block.timestamp < config.startTime)
            revert NotAuthorized();
        if (config.endTime > 0 && block.timestamp > config.endTime)
            revert NotAuthorized();
        _;
    }

    function initialize(
        address collection_,
        IInternetCameraFilm.Configuration memory config_
    ) public onlyInitializing {
        if (config.premint > config.maxSupply) revert NotAuthorized();
        collection = collection_;
        config = config_;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}(
            new bytes(0)
        );
        if (!success) revert WithdrawFailed();
    }
}
