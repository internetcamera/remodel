// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {IInternetCameraFilm} from "../interfaces/IFilm.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract InternetCameraFilm is IInternetCameraFilm, Initializable {
    address public collection;
    IInternetCameraFilm.Configuration public config;

    modifier onlyCollectionContract() {
        if (msg.sender != address(collection)) revert FilmNotAuthorized();
        _;
    }

    function __InternetCameraFilm_init(
        address collection_,
        IInternetCameraFilm.Configuration memory config_
    ) internal onlyInitializing {
        collection = collection_;
        config = config_;
    }
}
