// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Interface for Uniswap-like AMMs (Uniswap, Sushiswap, LuaSwap, etc.)
interface IUniswapLike {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

contract Aggregator {
    using SafeMath for uint256;

    // Array to store AMMs
    IUniswapLike public amm1; //uniswap
    IUniswapLike public amm2; //sushiswap
    IUniswapLike public amm3; //shibaswap

    // Array to store potential intermediate tokens
    address public weth; //weth
    address public dai; //dai
    address public wbtc; //wbtc

    constructor(IUniswapLike _amm1, IUniswapLike _amm2, IUniswapLike _amm3, address _weth, address _dai, address _wbtc) {
        amm1 = _amm1;
        amm2 = _amm2;
        amm3 = _amm3;
        weth = _weth;
        dai = _dai;
        wbtc = _wbtc;
    }

    function calculateBestRate(address token1, address token2, uint256 amount, bool isBuying) public view returns (uint256 bestRate, IUniswapLike bestAMM) {
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;
        uint256[] memory amm1Price = amm1.getAmountsOut(amount, path);
        uint256[] memory amm2Price = amm2.getAmountsOut(amount, path);
        uint256[] memory amm3Price = amm3.getAmountsOut(amount, path);

        if (!isBuying) {
            if (amm1Price[1] > amm2Price[1] && amm1Price[1] > amm3Price[1]) {
                return (amm1Price[1], amm1);
            } else if (amm2Price[1] > amm1Price[1] && amm2Price[1] > amm3Price[1]) {
                return (amm2Price[1], amm2);
            } else {
                return (amm3Price[1], amm3);
            }
        } else {
            if (amm1Price[1] < amm2Price[1] && amm1Price[1] < amm3Price[1]) {
                return (amm1Price[1], amm1);
            } else if (amm2Price[1] < amm1Price[1] && amm2Price[1] < amm3Price[1]) {
                return (amm2Price[1], amm2);
            } else {
                return (amm3Price[1], amm3);
            }
        }
    }
}
