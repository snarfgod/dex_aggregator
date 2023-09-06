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

    /**
     * @dev Calculates the best rate (either buying or selling) for a token pair across all AMMs.
     * Considers both direct and multi-hop rates.
     * @param token1 The address of the input token.
     * @param token2 The address of the output token.
     * @param amount The amount of token1 to be swapped.
     * @param isBuying If true, the function tries to minimize the rate, otherwise it tries to maximize.
     * @return bestRate The best rate for the specified token pair and amount.
     */
    function calculateBestRate(address token1, address token2, uint256 amount, bool isBuying) public view returns (uint256 bestRate) {
        uint256 directRate = calculateBestDirectRate(token1, token2, amount, isBuying);

        require(directRate > 0, "Error in direct rate");

        return directRate;
    }

    /**
     * @dev Helper function to calculate the best direct rate for a token pair across all AMMs.
     * @param token1 The address of the input token.
     * @param token2 The address of the output token.
     * @param amount The amount of token1 to be swapped.
     * @param isBuying If true, the function tries to minimize the rate, otherwise it tries to maximize.
     * @return bestRate The best direct rate for the specified token pair and amount.
     */
    function calculateBestDirectRate(address token1, address token2, uint256 amount, bool isBuying) internal view returns (uint256 bestRate) {
        bestRate = isBuying ? type(uint256).max : 0;
        for (uint i = 0; i < amms.length; i++) {
            address[] memory path = new address[](2);
            path[0] = token1;
            path[1] = token2;
            uint[] memory amountsOut = amms[i].getAmountsOut(amount, path);
            if (isBuying) {
                if (amountsOut[1] < bestRate) {
                    bestRate = amountsOut[1];
                }
            } else {
                if (amountsOut[1] > bestRate) {
                    bestRate = amountsOut[1];
                }
            }
        }
    }
}
