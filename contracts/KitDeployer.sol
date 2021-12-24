// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IInternetCameraFilm} from "./interfaces/IFilm.sol";
import {IInternetCameraCollection} from "./interfaces/ICollection.sol";
import {IInternetCameraRegistry} from "./interfaces/IRegistry.sol";

contract InternetCameraKitDeployer {
    constructor(
        string memory name,
        string memory symbol,
        address filmImplementation,
        IInternetCameraFilm.Configuration memory filmConfig,
        address collectionImplementation,
        address registry
    ) {
        address film = Clones.clone(filmImplementation);
        address collection = Clones.clone(collectionImplementation);

        IInternetCameraFilm(film).initialize(
            name,
            symbol,
            msg.sender,
            collection,
            filmConfig
        );
        IInternetCameraCollection(collection).initialize(film, name, symbol);
        IInternetCameraRegistry(registry).register(film, collection);
    }
}
