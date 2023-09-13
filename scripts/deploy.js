
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Aggregator with account:", deployer.address);

  const Aggregator = await ethers.getContractFactory("Aggregator");
  
  const aggregator = await Aggregator.deploy(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router
    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // SushiSwap Router
    "0x03f7724180AA6b939894B5Ca4314783B0b36b329", // ShibaSwap Router
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" // WBTC
    );
  await aggregator.deployed();

  console.log("Aggregator deployed to:", aggregator.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
