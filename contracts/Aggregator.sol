// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Interface for Uniswap-like AMMs (Uniswap, Sushiswap, LuaSwap, etc.)
interface IUniswapLike {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
}

contract Aggregator {
    using SafeMath for uint256;

    // Array to store AMMs
    IUniswapLike[] public amms;
    // Array to store potential intermediate tokens
    address[] public intermediateTokens;

    constructor(IUniswapLike[] memory _amms, address[] memory _intermediateTokens) {
        amms = _amms;
        intermediateTokens = _intermediateTokens;
    }

    function calculateBestRate(address token1, address token2, uint256 amount, bool isBuying) public view returns (uint256 bestRate) {
        (uint256 directRate, ) = calculateBestDirectRate(token1, token2, amount, isBuying);
        require(directRate > 0, "Error in direct rate");
        return directRate;
    }

    function calculateBestDirectRate(address token1, address token2, uint256 amount, bool isBuying) internal view returns (uint256 bestRate, uint bestAmmIndex) {
        bestRate = isBuying ? type(uint256).max : 0;
        bool foundSuitableAmm = false;
        bestAmmIndex = 0; // Default value

        for (uint i = 0; i < amms.length; i++) {
            address[] memory path = new address[](2);
            path[0] = token1;
            path[1] = token2;

            uint[] memory amountsOut = amms[i].getAmountsOut(amount, path);
            if (isBuying) {
                if (amountsOut[1] < bestRate) {
                    bestRate = amountsOut[1];
                    bestAmmIndex = i;
                    foundSuitableAmm = true;
                }
            } else {
                if (amountsOut[1] > bestRate) {
                    bestRate = amountsOut[1];
                    bestAmmIndex = i;
                    foundSuitableAmm = true;
                }
            }
        }

        require(foundSuitableAmm, "No suitable AMM found");
        return (bestRate, bestAmmIndex);
    }
}
