// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IInternetCameraCollection {
    event PostCreated(uint256 indexed tokenId, string ipfsHash);
    event PostRemoved(uint256 indexed tokenId);

    error NotAuthorized();

    function initialize(
        address film,
        address creator,
        string memory name,
        string memory symbol
    ) external;

    function filmAddress() external view returns (address);

    function totalSupply() external view returns (uint256);

    function post(
        address creator,
        uint256 tokenId,
        string memory ipfsHash
    ) external;
}
