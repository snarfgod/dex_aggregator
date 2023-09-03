//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AMM.sol";

contract Aggregator {
    AMM public amm1;
    AMM public amm2;
    uint256 public price1;
    uint256 public price2;

    mapping(address => uint256) public prices;

    constructor(AMM _amm1, AMM _amm2) {
        amm1 = _amm1;
        amm2 = _amm2;
    }

    function token1Quote(uint256 _token1Amount) external returns(uint256, address) {
        price1 = amm1.calculateToken1Swap(_token1Amount);
        price2 = amm2.calculateToken1Swap(_token1Amount);

        if(price1 < price2){
            return (price1, address(amm1));
        } else {
            return (price2, address(amm2));
        }
    }

    function token2Quote(uint256 _token2Amount) external returns(uint256, address) {
        price1 = amm1.calculateToken2Swap(_token2Amount);
        price2 = amm2.calculateToken2Swap(_token2Amount);

        if(price1 < price2){
            return (price1, address(amm1));
        } else {
            return (price2, address(amm2));
        }
    }

}