
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Aggregator Contract", function () {
  const UNISWAP = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Uniswap Router
  const SUSHISWAP = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";  // SushiSwap Router
  const SHIBASWAP = "0x03f7724180AA6b939894B5Ca4314783B0b36b329";  // ShibaSwap Router
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const MATIC = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";

  let rate, AMM, accounts, aggregator, owner;

  beforeEach(async function () {
    const Aggregator = await ethers.getContractFactory("Aggregator");
    accounts = await ethers.getSigners();
    owner = accounts[0];
    
    // Deploy the aggregator with AMMs and intermediate tokens
    aggregator = await Aggregator.deploy(UNISWAP, SUSHISWAP, SHIBASWAP, WETH, DAI, MATIC);
    await aggregator.deployed();
  });

  it("Should deploy the Aggregator", async function () {

    expect(aggregator.address).to.be.properAddress;
  });

  it("Should return the swap rate for 1 WETH to DAI from Uniswap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(UNISWAP, WETH, DAI, amount);
    console.log("swap rate for 1 WETH to DAI on Uniswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the swap rate for 1 WETH to DAI from SushiSwap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SUSHISWAP, WETH, DAI, amount);
    console.log("swap rate for 1 WETH to DAI on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the swap rate for 1 WETH to DAI from ShibaSwap", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SHIBASWAP, WETH, DAI, amount);
    console.log("swap rate for 1 WETH to DAI on ShibaSwap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  });

  it("Should return the price of 1WBTC to DAI on Uniswap", async () => {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(UNISWAP, MATIC, DAI, amount);
    console.log("swap rate for 1 MATIC to DAI on Uniswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  })

  it("Should return the price of MATIC to WETH on Uniswap", async () => {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(UNISWAP, MATIC, WETH, amount);
    console.log("swap rate for 1 MATIC to WETH on Uniswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  })

  it("Should return the price of WETH to MATIC on Uniswap", async () => {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(UNISWAP, WETH, MATIC, amount);
    console.log("Sell rate for 1 WETH to MATIC on Uniswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  })
  it("Should return the best price of DAI to MATIC on Shibaswap", async () => {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SHIBASWAP, DAI, MATIC, amount);
    console.log("Swap rate for 1 DAI to MATIC on Shibaswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  })
  it("Should return the best price of MATIC to DAI on Shibaswap", async () => {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const rate = await getDirectRateFromSingleAMM(SHIBASWAP, MATIC, DAI, amount);
    console.log("Swap rate for 1 MATIC to DAI on Shibaswap is:", ethers.utils.formatUnits(rate, 18));
    expect(rate).to.be.gt(0);
  })

  it("Should return the best swap rate for 1 WETH to DAI using aggregator", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const [rate, AMM] = await aggregator.calculateBestRate(WETH, DAI, amount);
    console.log("Best swap rate for 1 WETH to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
    console.log("Best AMM is:", AMM.toString());
    expect(rate).to.be.gt(0);
  });
  
  it("Should return the best swap rate for 1 WETH to DAI using aggregator", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 18 decimals for the token
    const [rate, AMM] = await aggregator.calculateBestRate(WETH, DAI, amount);
    console.log("Best swap rate for 1 WETH to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
    console.log("Best AMM is:", AMM.toString());
    expect(rate).to.be.gt(0);
  });
  it("Should return the best swap rates for MATIC to DAI using aggregator", async function () {
    const amount = ethers.utils.parseUnits("1", 18);  // Assuming 8 decimals for the token
    const [sellRate, sellAMM] = await aggregator.calculateBestRate(MATIC, DAI, amount);
    console.log("Best swap rate for 1 MATIC to DAI using aggregator is:", ethers.utils.formatUnits(sellRate, 18));
    console.log("Best AMM is:", sellAMM.toString());
    expect(sellRate).to.be.gt(0);
    const [buyRate, buyAMM] = await aggregator.calculateBestRate(DAI, MATIC, amount);
    console.log("Best swap rate for 1 DAI to MATIC using aggregator is:", ethers.utils.formatUnits(buyRate, 18));
    console.log("Best AMM is:", buyAMM.toString());
    expect(buyRate).to.be.gt(0);
  });

 
  async function getDirectRateFromSingleAMM(ammAddress, token1, token2, amount) {
    const amm = new ethers.Contract(ammAddress, ["function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const rates = await amm.getAmountsOut(amount, path);
    return rates[1];
  }
});
