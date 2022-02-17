// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IInternetCameraFilm {
    struct Configuration {
        bool mintable;
        uint256 price;
        uint256 premint;
        uint256 maxSupply;
        uint256 startTime;
        uint256 endTime;
    }

    error WithdrawFailed();
    error FilmNotAuthorized();

    function initialize(
        string memory name,
        string memory symbol,
        address creator,
        address collection,
        Configuration memory config
    ) external;

    function collection() external view returns (address);
}
