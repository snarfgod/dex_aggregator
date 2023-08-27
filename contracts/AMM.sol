//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

//Manage pool
//Manage deposits
//Facilitate swaps
//Manage withdrawals

contract AMM {
    Token public token1;
    Token public token2;
    uint256 public token1Balance;
    uint256 public token2Balance;
    uint256 public K;

    constructor(Token _token1, Token _token2) {
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(uint256 _token1Amount, uint256 _token2Amount) external {
        require(_token1Amount > 0 && _token2Amount > 0, "Insufficient liquidity");
        require(token1.transferFrom(msg.sender, address(this), _token1Amount), "failed token1 transfer");
        require(token2.transferFrom(msg.sender, address(this), _token2Amount), "failed token2 transfer");

        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance;
    }

    
}
