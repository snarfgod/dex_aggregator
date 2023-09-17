// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Interface for Uniswap-like AMMs
interface IUniswapLike {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns(uint[] memory amounts);
}

// Interface for ERC20 tokens
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract Aggregator {
    using SafeMath for uint256;

    // Array to store AMMs
    IUniswapLike public amm1; //uniswap
    IUniswapLike public amm2; //sushiswap
    IUniswapLike public amm3; //shibaswap

    // Array to store tokens
    IERC20 public weth; //weth
    IERC20 public dai; //dai
    IERC20 public matic; //matic

    constructor(address _amm1, address _amm2, address _amm3, address _weth, address _dai, address _matic) {
        amm1 = IUniswapLike(_amm1);
        amm2 = IUniswapLike(_amm2);
        amm3 = IUniswapLike(_amm3);
        weth = IERC20(_weth);
        dai = IERC20(_dai);
        matic = IERC20(_matic);
    }

    function calculateBestRate(address token1, address token2, uint256 amount) external view returns (uint256 bestRate, IUniswapLike bestAMM) {
        require(token1 != address(0) && token2 != address(0), "Token addresses cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;
        uint256[] memory amm1Price = amm1.getAmountsOut(amount, path);
        uint256[] memory amm2Price = amm2.getAmountsOut(amount, path);
        uint256[] memory amm3Price = amm3.getAmountsOut(amount, path);

        //User will always want the highest output for any input
        
        //Check if amm1 is the best
        if (amm1Price[1] > amm2Price[1] && amm1Price[1] > amm3Price[1]) {
            return (amm1Price[1], amm1);
        }
        //Check if amm2 is the best
        else if (amm2Price[1] > amm1Price[1] && amm2Price[1] > amm3Price[1]) {
            return (amm2Price[1], amm2);
        }
        //Check if amm3 is the best
        else if (amm3Price[1] > amm1Price[1] && amm3Price[1] > amm2Price[1]) {
            return (amm3Price[1], amm3);
        }
    }

    function executeSwap(IUniswapLike amm, address token1, address token2, uint256 amount) external {
        require(token1 != address(0) && token2 != address(0), "Token addresses cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        require(amm == amm1 || amm == amm2 || amm == amm3, "Invalid AMM");
        IERC20(token1).approve(address(amm), amount);
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;
        uint256[] memory ammPrice = amm.getAmountsOut(amount, path);
        uint256 amountOutMin = ammPrice[1].mul(75).div(100);

        //Execute swap
        amm.swapExactTokensForTokens(amount, amountOutMin, path, msg.sender, block.timestamp + 1500);
    }
}
