//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AMM.sol";

contract Aggregator {
    AMM public amm1;
    AMM public amm2;
    AMM public bestAMM;
    uint256 public bestPrice;

    constructor(AMM _amm1, AMM _amm2) {
        amm1 = _amm1;
        amm2 = _amm2;
    }

    function token1Quote(uint256 _token1Amount) external {
        uint256 price1 = amm1.calculateToken1Swap(_token1Amount);
        uint256 price2 = amm2.calculateToken1Swap(_token1Amount);

        if(price1 <= price2){
            bestPrice=price1;
            bestAMM=amm1;
        } else {
            bestPrice=price2;
            bestAMM=amm2;
        }
    }

    function token2Quote(uint256 _token2Amount) external {
        uint256 price1 = amm1.calculateToken2Swap(_token2Amount);
        uint256 price2 = amm2.calculateToken2Swap(_token2Amount);

        if(price1 <= price2){
            bestPrice=price1;
            bestAMM=amm1;
        } else {
            bestPrice=price2;
            bestAMM=amm2;
        }
    }

}