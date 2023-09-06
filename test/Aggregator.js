
const { ethers } = require("hardhat");
const { expect } = require("chai");
let aggregator, owner;

describe("Aggregator Contract", function () {
  const UNISWAP = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Uniswap Router
  const SUSHISWAP = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";  // SushiSwap Router
  const SHIBASWAP = "0x03f7724180AA6b939894B5Ca4314783B0b36b329";  // ShibaSwap Router
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  //const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

  beforeEach(async function () {
    const Aggregator = await ethers.getContractFactory("Aggregator");
    accounts = await ethers.getSigners();
    owner = accounts[0];
    
    // Deploy the aggregator with AMMs and intermediate tokens
    aggregator = await Aggregator.deploy([UNISWAP, SUSHISWAP, SHIBASWAP], [WETH, DAI, WBTC]);
    await aggregator.deployed();
  });

  it("Should deploy the Aggregator", async function () {
    expect(aggregator.address).to.be.properAddress;
  });

  it("Should return the sell rate for 1 WETH to DAI from Uniswap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(UNISWAP, WETH, DAI, amount, false);
    console.log("Sell rate for 1 WETH to DAI on Uniswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the sell rate for 1 WETH to DAI from SushiSwap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SUSHISWAP, WETH, DAI, amount, false);
    console.log("Sell rate for 1 WETH to DAI on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the sell rate for 1 WETH to DAI from ShibaSwap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SHIBASWAP, WETH, DAI, amount, false);
    console.log("Sell rate for 1 WETH to DAI on ShibaSwap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the best sell rate for 1 WETH to DAI using aggregator", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await aggregator.calculateBestRate(WETH, DAI, amount, false);
    console.log("Best sell rate for 1 WETH to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });
  
  it("Should return the best buy rate for 1 WETH to DAI using aggregator", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await aggregator.calculateBestRate(WETH, DAI, amount, true);
    console.log("Best buy rate for 1 WETH to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });
 
  async function getDirectRateFromSingleAMM(ammAddress, token1, token2, amount, isBuying) {
    const amm = new ethers.Contract(ammAddress, ["function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const rates = await amm.getAmountsOut(amount, path);
    return rates[1];
  }
});
