// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IInternetCameraRegistry {
    struct Kit {
        address filmImplementation;
        address collectionImplementation;
    }

    function register(address film, address collection) external;
}
