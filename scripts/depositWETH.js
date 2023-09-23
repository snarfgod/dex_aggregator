const { ethers } = require("hardhat");
const WETH_ABI = require("../helpers/WETH.json");
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"


async function main() {
  const [owner] = await ethers.getSigners();
  const wethContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider)

  // Wrap 10 ETH to WETH
  const amount = ethers.utils.parseUnits("10", 18)
  await wethContract.connect(owner).deposit({ value: amount });

  const balance = await wethContract.balanceOf(owner.address);
  console.log(`Wrapped ${ethers.utils.formatEther(balance)} WETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
