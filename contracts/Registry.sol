//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IInternetCameraRegistry} from "./interfaces/IRegistry.sol";

contract InternetCameraRegistry is
    IInternetCameraRegistry,
    Initializable,
    OwnableUpgradeable
{
    mapping(bytes32 => bool) public delisted;

    event DeploymentRegistered(
        address indexed creator,
        address film,
        address collection,
        bytes32 kitId
    );
    event DeploymentDelisted(address indexed film, address indexed collection);

    error NotAuthorized();

    constructor() initializer {
        __Ownable_init();
    }

    function register(address film, address collection) public {
        if (delisted[getDeploymentId(film, collection)]) revert NotAuthorized();

        // TODO: Check ERC165 interface on film and collection
        emit DeploymentRegistered(
            _msgSender(),
            film,
            collection,
            getDeploymentId(film, collection)
        );
    }

    function getDeploymentId(address film, address collection)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(film, collection));
    }

    // Admin functions
    function delist(address film, address collection) public onlyOwner {
        delisted[getDeploymentId(film, collection)] = true;
        emit DeploymentDelisted(film, collection);
    }
}
