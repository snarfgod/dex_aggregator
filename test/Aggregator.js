
const { ethers } = require("hardhat");
const { expect } = require("chai");
const WETH_ABI = require("../helpers/WETH.json");
const DAI_ABI = require("../helpers/DAI.json");
const MATIC_ABI = require("../helpers/MATIC.json");



describe("Aggregator Contract", function () {
  const UNISWAP = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Uniswap Router
  const SUSHISWAP = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";  // SushiSwap Router
  const SHIBASWAP = "0x03f7724180AA6b939894B5Ca4314783B0b36b329";  // ShibaSwap Router
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const MATIC = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";

  let transaction, amount, rate, AMM, accounts, aggregator, owner, user, vitalik, vitalikAddress;

  const uniswap = new ethers.Contract(UNISWAP, ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"]);
  const daiContract = new ethers.Contract(DAI, DAI_ABI, ethers.provider)
  const wethContract = new ethers.Contract(WETH, WETH_ABI, ethers.provider)
  const maticContract = new ethers.Contract(MATIC, MATIC_ABI, ethers.provider)

  beforeEach(async function () {
    const Aggregator = await ethers.getContractFactory("Aggregator");
    accounts = await ethers.getSigners();
    owner = accounts[0];
    user = accounts[1];
    
    // Deploy the aggregator with AMMs and intermediate tokens
    aggregator = await Aggregator.deploy(UNISWAP, SUSHISWAP, SHIBASWAP, WETH, DAI, MATIC);
    await aggregator.deployed();
    amount = ethers.utils.parseUnits("1", 18) //Assuming 18 decimals for the token
  });
  it("Should deploy the Aggregator", async function () {
    expect(aggregator.address).to.be.properAddress;
  });
  
  describe("Gets swap rates directly from exchanges", async () => {
    
    describe("Uniswap", async () => {
      it("Should return the output for 1 WETH to DAI from Uniswap", async function () {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, WETH, DAI, amount);
        console.log("Output for 1 WETH to DAI on Uniswap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      });
      it("Should return the output of 1 DAI to WETH on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, DAI, WETH, amount)
        console.log("Output from one DAI to WETH on Uniswap is:", ethers.utils.formatUnits(rate, 18))
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to DAI on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, MATIC, DAI, amount);
        console.log("Output for 1 MATIC to DAI on Uniswap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 DAI to MATIC on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, DAI, MATIC, amount);
        console.log("Output for 1 DAI to MATIC on Uniswap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to WETH on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, MATIC, WETH, amount);
        console.log("Output for 1 MATIC to WETH on Uniswap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 WETH to MATIC on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(UNISWAP, WETH, MATIC, amount);
        console.log("Output for 1 WETH to MATIC on Uniswap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
    })
    describe("Sushiswap", async () => {
      it("Should return the swap rate for 1 WETH to DAI from SushiSwap", async function () {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, WETH, DAI, amount);
        console.log("swap rate for 1 WETH to DAI on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      });
      it("Should return the output of 1 DAI to WETH on Uniswap", async () => {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, DAI, WETH, amount)
        console.log("Output from one DAI to WETH on SushiSwap is:", ethers.utils.formatUnits(rate, 18))
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to DAI on SushiSwap", async () => {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, MATIC, DAI, amount);
        console.log("Output for 1 MATIC to DAI on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 DAI to MATIC on SushiSwap", async () => {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, DAI, MATIC, amount);
        console.log("Output for 1 DAI to MATIC on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to WETH on SushiSwap", async () => {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, MATIC, WETH, amount);
        console.log("Output for 1 MATIC to WETH on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 WETH to MATIC on SushiSwap", async () => {
        const rate = await getDirectRateFromSingleAMM(SUSHISWAP, WETH, MATIC, amount);
        console.log("Output for 1 WETH to MATIC on SushiSwap is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
    })
    describe("Shibaswap", async () => {
      it("Should return the output for 1 WETH to DAI from SHIBASWAP", async function () {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, WETH, DAI, amount);
        console.log("Output for 1 WETH to DAI on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      });
      it("Should return the output of 1 DAI to WETH on SHIBASWAP", async () => {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, DAI, WETH, amount)
        console.log("Output from one DAI to WETH on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18))
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to DAI on SHIBASWAP", async () => {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, MATIC, DAI, amount);
        console.log("Output for 1 MATIC to DAI on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 DAI to MATIC on SHIBASWAP", async () => {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, DAI, MATIC, amount);
        console.log("Output for 1 DAI to MATIC on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 MATIC to WETH on SHIBASWAP", async () => {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, MATIC, WETH, amount);
        console.log("Output for 1 MATIC to WETH on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
      it("Should return the output of 1 WETH to MATIC on SHIBASWAP", async () => {
        const rate = await getDirectRateFromSingleAMM(SHIBASWAP, WETH, MATIC, amount);
        console.log("Output for 1 WETH to MATIC on SHIBASWAP is:", ethers.utils.formatUnits(rate, 18));
        expect(rate).to.be.gt(0);
      })
    })
  })
  describe("Aggregator calculates best AMM and price", async () => {
    beforeEach(async () => {
      const amount = ethers.utils.parseUnits("1", 18) //Assuming 18 decimals for the token
    })
    it("Should return the best swap rate for 1 WETH to DAI using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(WETH, DAI, amount);
      console.log("Best swap rate for 1 WETH to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
    it("Should return the best swap rate for 1 DAI to WETH using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(DAI, WETH, amount);
      console.log("Best swap rate for 1 DAI to WETH using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
    it("Should return the best swap rate for 1 MATIC to DAI using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(MATIC, DAI, amount);
      console.log("Best swap rate for 1 MATIC to DAI using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
    it("Should return the best swap rate for 1 DAI to MATIC using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(DAI, MATIC, amount);
      console.log("Best swap rate for 1 DAI to MATIC using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
    it("Should return the best swap rate for 1 WETH to MATIC using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(WETH, MATIC, amount);
      console.log("Best swap rate for 1 WETH to MATIC using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
    it("Should return the best swap rate for 1 MATIC to WETH using aggregator", async function () {
      const [rate, AMM] = await aggregator.calculateBestRate(MATIC, WETH, amount);
      console.log("Best swap rate for 1 MATIC to WETH using aggregator is:", ethers.utils.formatUnits(rate, 18));
      console.log("Best AMM is:", AMM.toString());
      expect(rate).to.be.gt(0);
    });
  })
  describe("Swapping directly on each exchange", async () => {
    beforeEach(async () => {
    })
    describe("Uniswap", async () => {
      it("Successfully swaps 1 WETH for DAI on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance, should be 1
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        //Perform Swap
        transaction = await swapOnUniswap(WETH, DAI, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });

      })
      it("Successfully swaps 1 DAI for WETH on Uniswap", async () => {

      })
      it("Successfully swaps 1 MATIC for DAI on Uniswap", async () => {

      })
      it("Successfully swaps 1 DAI for MATIC on Uniswap", async () => {

      })
      it("Successfully swaps 1 WETH for MATIC on Uniswap", async () => {

      })
      it("Successfully swaps 1 MATIC for WETH on Uniswap", async () => {

      })
    })
    describe("SushiSwap", async () => {
      it("Successfully swaps 1 WETH for DAI on SushiSwap", async () => {

      })
      it("Successfully swaps 1 DAI for WETH on SushiSwap", async () => {

      })
      it("Successfully swaps 1 MATIC for DAI on SushiSwap", async () => {

      })
      it("Successfully swaps 1 DAI for MATIC on SushiSwap", async () => {

      })
      it("Successfully swaps 1 WETH for MATIC on SushiSwap", async () => {

      })
      it("Successfully swaps 1 MATIC for WETH on SushiSwap", async () => {

      })
    })
    describe("ShibaSwap", async () => {
      it("Successfully swaps 1 WETH for DAI on ShibaSwap", async () => {

      })
      it("Successfully swaps 1 DAI for WETH on ShibaSwap", async () => {

      })
      it("Successfully swaps 1 MATIC for DAI on ShibaSwap", async () => {

      })
      it("Successfully swaps 1 DAI for MATIC on ShibaSwap", async () => {

      })
      it("Successfully swaps 1 WETH for MATIC on ShibaSwap", async () => {

      })
      it("Successfully swaps 1 MATIC for WETH on ShibaSwap", async () => {

      })
    })
  })

// Functions to test direct swaps on each exchange

async function swapOnUniswap(token1, token2, amount) {
    const path = [token1, token2];
    const amountIn = amount;
    const amountOutMin = amount;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    //Approve aggregator to swap user's WETH with user as signer
    transaction = await wethContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
    await transaction.wait()
    transaction = await uniswap.connect(vitalik).swapExactTokensForTokens(amountIn, amountOutMin, path, vitalikAddress, deadline, { gasLimit: 400000 });
    await transaction.wait();
    //check WETH balance for user
    const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
    console.log("WETH balance after swap is:", wethBalanceAfter)
    return transaction;
  }

  async function swapOnSushiswap(token1, token2, amount) {
    const sushiswap = new ethers.Contract(SUSHISWAP, ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
    const amountOutMin = ethers.utils.parseUnits((amount*.9).toString(), 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const tx = await sushiswap.swapExactTokensForTokens(amountIn, amountOutMin, path, owner.address, deadline, { gasLimit: 400000 });
    await tx.wait();
    return tx;
  }

  async function swapOnShibaswap(token1, token2, amount) {
    const shibaswap = new ethers.Contract(SHIBASWAP, ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
    const amountOutMin = ethers.utils.parseUnits((amount*.9).toString(), 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const tx = await shibaswap.swapExactTokensForTokens(amountIn, amountOutMin, path, owner.address, deadline, { gasLimit: 400000 });
    await tx.wait();
    return tx;
  }
 
  async function getDirectRateFromSingleAMM(ammAddress, token1, token2, amount) {
    const amm = new ethers.Contract(ammAddress, ["function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const rates = await amm.getAmountsOut(amount, path);
    return rates[1];
  }
  
});
