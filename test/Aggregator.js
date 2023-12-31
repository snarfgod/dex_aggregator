
const { ethers } = require("hardhat");
const { expect } = require("chai");
const WETH_ABI = require("../helpers/WETH.json");
const DAI_ABI = require("../helpers/DAI.json");
const MATIC_ABI = require("../helpers/MATIC.json");
const UNISWAP_ABI = require("../helpers/UniswapABI.json");



describe("Aggregator Contract", function () {
  const UNISWAP = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";  // Uniswap Router
  const SUSHISWAP = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";  // SushiSwap Router
  const SHIBASWAP = "0x03f7724180AA6b939894B5Ca4314783B0b36b329";  // ShibaSwap Router
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const MATIC = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";

  let transaction, amount, rate, AMM, accounts, aggregator, owner, user, vitalik, vitalikAddress, amountOutMin;

  const uniswap = new ethers.Contract(UNISWAP, UNISWAP_ABI, ethers.provider);
  const sushiswap = new ethers.Contract(SUSHISWAP, UNISWAP_ABI, ethers.provider);
  const shibaswap = new ethers.Contract(SHIBASWAP, UNISWAP_ABI, ethers.provider);
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
        //Approve aggregator to swap user's WETH with user as signer
        transaction = await wethContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(WETH, DAI, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
      })
      it("Successfully swaps 1 DAI for WETH on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = 100 //needs to be low because one DAI is a very small amount of WETH
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(DAI, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
        //Check WETH balance is greater than before
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for DAI on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Vitalik has no MATIC, so we need to give him some by swapping some WETH for MATIC
        transaction = await wethContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        transaction = await swapOnUniswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await maticContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(MATIC, DAI, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
      it("Successfully swaps 1 DAI for MATIC on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(DAI, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 WETH for MATIC on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's WETH
        transaction = await wethContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for WETH on Uniswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = 100 //matic is cheap af compared to weth
        //Approve uniswap to swap vitalik's WETH
        transaction = await maticContract.connect(vitalik).approve(uniswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnUniswap(MATIC, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
    })
    describe("SushiSwap", async () => {
      it("Successfully swaps 1 WETH for DAI on Sushiswap", async () => {
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
        //Approve aggregator to swap user's WETH with user as signer
        transaction = await wethContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(WETH, DAI, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
      })
      it("Successfully swaps 1 DAI for WETH on Sushiswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = 100 //needs to be low because one DAI is a very small amount of WETH
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(DAI, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
        //Check WETH balance is greater than before
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for DAI on Sushiswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Vitalik has no MATIC, so we need to give him some by swapping some WETH for MATIC
        transaction = await wethContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        transaction = await swapOnSushiswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await maticContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(MATIC, DAI, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
      it("Successfully swaps 1 DAI for MATIC on Sushiswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(DAI, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 WETH for MATIC on Sushiswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's WETH
        transaction = await wethContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for WETH on Sushiswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = 100 //matic is cheap af compared to weth
        //Approve uniswap to swap vitalik's WETH
        transaction = await maticContract.connect(vitalik).approve(sushiswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnSushiswap(MATIC, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
    })
    describe("ShibaSwap", async () => {
      it("Successfully swaps 1 WETH for DAI on Shibaswap", async () => {
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
        //Approve aggregator to swap user's WETH with user as signer
        transaction = await wethContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(WETH, DAI, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
      })
      it("Successfully swaps 1 DAI for WETH on Shibaswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = 100 //needs to be low because one DAI is a very small amount of WETH
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(DAI, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check DAI balance is greater than 0
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
        //Check WETH balance is greater than before
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)

        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for DAI on Shibaswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Vitalik has no MATIC, so we need to give him some by swapping some WETH for MATIC
        transaction = await wethContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        transaction = await swapOnShibaswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amount)
        await transaction.wait()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await maticContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(MATIC, DAI, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
      it("Successfully swaps 1 DAI for MATIC on Shibaswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        //Check DAI balance is 0
        const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance before swap is:", daiBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's DAI
        transaction = await daiContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(DAI, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
        //Check DAI balance after swap
        const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("DAI balance after swap is:", daiBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(daiBalanceAfter).to.be.lt(daiBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 WETH for MATIC on Shibaswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = ethers.utils.parseUnits('.3', 18) //MATIC is about 50 cents, so this is a reasonable amount
        //Approve uniswap to swap vitalik's WETH
        transaction = await wethContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(WETH, MATIC, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.gt(maticBalanceBefore)
      })
      it("Successfully swaps 1 MATIC for WETH on Shibaswap", async () => {
        //Impersonate Vitalik's account
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
        vitalikAddress = await vitalik.getAddress()

        //Check WETH balance
        const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance before swap is:", wethBalanceBefore)
        //Check MATIC balance
        const maticBalanceBefore = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance before swap is:", maticBalanceBefore)
        amountOutMin = 100 //matic is cheap af compared to weth
        //Approve uniswap to swap vitalik's WETH
        transaction = await maticContract.connect(vitalik).approve(shibaswap.address, ethers.utils.parseUnits('1', 18))
        await transaction.wait()
        //Perform Swap
        transaction = await swapOnShibaswap(MATIC, WETH, ethers.utils.parseUnits('1', 18), amountOutMin)
        await transaction.wait()
        //Check WETH balance after swap
        const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("WETH balance after swap is:", wethBalanceAfter)
        //Check MATIC balance after swap
        const maticBalanceAfter = await maticContract.connect(vitalik).balanceOf(vitalikAddress)
        console.log("MATIC balance after swap is:", maticBalanceAfter)
    
        //Stop impersonating
        await hre.network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        });
        expect(wethBalanceAfter).to.be.gt(wethBalanceBefore)
        expect(maticBalanceAfter).to.be.lt(maticBalanceBefore)
      })
    })
  })
  describe("Swaps using aggregator", async () => {
    it("Swaps 1 WETH for DAI on Uniswap using aggregator", async () => {
      //Impersonate vitalik
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
      });
      vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      vitalikAddress = await vitalik.getAddress()

      // Get before balances
      const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance before swap is:", wethBalanceBefore)
      const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance before swap is:", daiBalanceBefore)

      transaction = await wethContract.connect(vitalik).approve(aggregator.address, ethers.utils.parseUnits('1', 18))
      await transaction.wait()
      //Perform Swap
      transaction = await aggregator.connect(vitalik).executeSwap(uniswap.address, WETH, DAI, ethers.utils.parseUnits('1', 18))
      await transaction.wait()

      // Get after balances
      const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance after swap is:", wethBalanceAfter)
      const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance after swap is:", daiBalanceAfter)

      expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
      expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
    })
    it("Swaps 1 WETH for DAI on Sushiswap using aggregator", async () => {
      //Impersonate vitalik
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
      });
      vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      vitalikAddress = await vitalik.getAddress()

      // Get before balances
      const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance before swap is:", wethBalanceBefore)
      const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance before swap is:", daiBalanceBefore)

      transaction = await wethContract.connect(vitalik).approve(aggregator.address, ethers.utils.parseUnits('1', 18))
      await transaction.wait()
      //Perform Swap
      transaction = await aggregator.connect(vitalik).executeSwap(sushiswap.address, WETH, DAI, ethers.utils.parseUnits('1', 18))
      await transaction.wait()

      // Get after balances
      const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance after swap is:", wethBalanceAfter)
      const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance after swap is:", daiBalanceAfter)

      expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
      expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
    })
    it("Swaps 1 WETH for DAI on Shibaswap using aggregator", async () => {
      //Impersonate vitalik
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
      });
      vitalik = await ethers.provider.getSigner("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      vitalikAddress = await vitalik.getAddress()

      // Get before balances
      const wethBalanceBefore = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance before swap is:", wethBalanceBefore)
      const daiBalanceBefore = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance before swap is:", daiBalanceBefore)

      transaction = await wethContract.connect(vitalik).approve(aggregator.address, ethers.utils.parseUnits('1', 18))
      await transaction.wait()
      //Perform Swap
      transaction = await aggregator.connect(vitalik).executeSwap(shibaswap.address, WETH, DAI, ethers.utils.parseUnits('1', 18))
      await transaction.wait()

      // Get after balances
      const wethBalanceAfter = await wethContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("WETH balance after swap is:", wethBalanceAfter)
      const daiBalanceAfter = await daiContract.connect(vitalik).balanceOf(vitalikAddress)
      console.log("DAI balance after swap is:", daiBalanceAfter)

      expect(wethBalanceAfter).to.be.lt(wethBalanceBefore)
      expect(daiBalanceAfter).to.be.gt(daiBalanceBefore)
    })
  })

// Functions to test direct swaps on each exchange

async function swapOnUniswap(token1, token2, amount, amountOutMin) {
    const path = [token1, token2];
    const amountIn = amount;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    
    transaction = await uniswap.connect(vitalik).swapExactTokensForTokens(amountIn, amountOutMin, path, vitalikAddress, deadline, { gasLimit: 400000 });
    await transaction.wait();
    
    return transaction;
  }

  async function swapOnSushiswap(token1, token2, amount) {
    const path = [token1, token2];
    const amountIn = amount;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    
    transaction = await sushiswap.connect(vitalik).swapExactTokensForTokens(amountIn, amountOutMin, path, vitalikAddress, deadline, { gasLimit: 400000 });
    await transaction.wait();
    
    return transaction;
  }

  async function swapOnShibaswap(token1, token2, amount) {
    const path = [token1, token2];
    const amountIn = amount;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    
    transaction = await shibaswap.connect(vitalik).swapExactTokensForTokens(amountIn, amountOutMin, path, vitalikAddress, deadline, { gasLimit: 400000 });
    await transaction.wait();
    
    return transaction;
  }
 
  async function getDirectRateFromSingleAMM(ammAddress, token1, token2, amount) {
    const amm = new ethers.Contract(ammAddress, ["function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint[] memory amounts)"], owner);
    const path = [token1, token2];
    const rates = await amm.getAmountsOut(amount, path);
    return rates[1];
  }
  
});
