const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('AMM', () => {
    let accounts, deployer, token1, token2, amm, liquidityProvider, transaction, investor1, investor2

    beforeEach(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      liquidityProvider = accounts[1]
      investor1 = accounts[2]
      investor2 = accounts[3]

      const Token = await ethers.getContractFactory('Token')
      token1 = await Token.deploy('Snarfcoin', 'SNRF', '1000000')
      token2 = await Token.deploy('USDC', 'USDC', '1000000')

      transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
      await transaction.wait()

      transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
      await transaction.wait()

      transaction = await token1.connect(deployer).transfer(investor1.address, tokens(100000))
      await transaction.wait()

      transaction = await token2.connect(deployer).transfer(investor2.address, tokens(100000))
      await transaction.wait()

      const AMM = await ethers.getContractFactory('AMM')
      amm = await AMM.deploy(token1.address, token2.address)
    })

    describe('Deployment', async () => {
      it('has an address', async () => {
        expect(amm.address).to.not.equal(0x0)
        expect(amm.address).to.not.equal('')
        expect(amm.address).to.not.equal(null)
        expect(amm.address).to.not.equal(undefined)
      })
      it('returns token1 and token2 addresses', async () => {
        expect(await amm.token1()).to.equal(token1.address)
        expect(await amm.token2()).to.equal(token2.address)
      })
    })
    describe('Swap', async () => {
      let amount, transaction, result, estimate, balance

      it('facilitates swaps', async () => {
        amount = tokens(100000)
        transaction = await token1.connect(deployer).approve(amm.address, amount)
        await transaction.wait()

        transaction = await token2.connect(deployer).approve(amm.address, amount)
        await transaction.wait()

        transaction = await amm.connect(deployer).addLiquidity(amount, amount)
        await transaction.wait()

        expect(await token1.balanceOf(amm.address)).to.equal(amount)
        expect(await token2.balanceOf(amm.address)).to.equal(amount)

        expect(await amm.token1Balance()).to.equal(amount)
        expect(await amm.token2Balance()).to.equal(amount)

        expect(await amm.shares(deployer.address)).to.equal(tokens(100))
        expect(await amm.totalShares()).to.equal(tokens(100))

        // Add more liquidity
        amount = tokens(50000)
        transaction = await token1.connect(liquidityProvider).approve(amm.address, amount)
        await transaction.wait()
        transaction = await token2.connect(liquidityProvider).approve(amm.address, amount)
        await transaction.wait()

        let token2Deposit = await amm.calculateToken2Deposit(amount)

        transaction = await amm.connect(liquidityProvider).addLiquidity(amount, token2Deposit)
        await transaction.wait()

        expect(await token1.balanceOf(amm.address)).to.equal(tokens(150000))
        expect(await token2.balanceOf(amm.address)).to.equal(tokens(150000))

        expect(await amm.token1Balance()).to.equal(tokens(150000))
        expect(await amm.token2Balance()).to.equal(tokens(150000))

        expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50))
        expect(await amm.shares(deployer.address)).to.equal(tokens(100))
        expect(await amm.totalShares()).to.equal(tokens(150))


        //Investor 1 Swaps
        //check the price before swapping
        console.log(`Price ${await amm.token2Balance() / await amm.token1Balance()}\n`)
        transaction = await token1.connect(investor1).approve(amm.address, tokens(100000))
        await transaction.wait()

        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance before swap: ${ethers.utils.formatEther(balance)}`)

        estimate = await amm.calculateToken1Swap(tokens(1))
        console.log(`Token2 received after swap: ${ethers.utils.formatEther(estimate)}\n`)

        transaction = await amm.connect(investor1).swapToken1(tokens(1))
        result = await transaction.wait()

        //Check that the event was emitted
        await expect(transaction).to.emit(amm, 'Swap').withArgs(
          investor1.address,
          token1.address,
          tokens(1),
          token2.address,
          estimate,
          await amm.token1Balance(),
          await amm.token2Balance(),
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )

        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance of token2 after swap: ${ethers.utils.formatEther(balance)}`)

        expect(estimate).to.equal(balance)

        //Check that AMM balances are in sync
        expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
        expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

        console.log(`Price after ${await amm.token2Balance() / await amm.token1Balance()}\n`)

        //Investor 1 swap more to watch price changes
        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance before swap: ${ethers.utils.formatEther(balance)}`)
        estimate = await amm.calculateToken1Swap(tokens(1))
        console.log(`Token2 received after swap: ${ethers.utils.formatEther(estimate)}`)
        transaction = await amm.connect(investor1).swapToken1(tokens(1))
        result = await transaction.wait()

        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance of token2 after swap: ${ethers.utils.formatEther(balance)}\n`)

        expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
        expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

        console.log(`Price after ${await amm.token2Balance() / await amm.token1Balance()}\n`)

        //Investor 1 swapping large amount
        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance before swap: ${ethers.utils.formatEther(balance)}`)
        estimate = await amm.calculateToken1Swap(tokens(10000))
        console.log(`Token2 received after swap: ${ethers.utils.formatEther(estimate)}`)
        transaction = await amm.connect(investor1).swapToken1(tokens(10000))
        result = await transaction.wait()

        balance = await token2.balanceOf(investor1.address)
        console.log(`Investor 1 balance of token2 after swap: ${ethers.utils.formatEther(balance)}\n`)
        expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
        expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

        console.log(`Price after ${await amm.token2Balance() / await amm.token1Balance()}\n`)



        //Investor 2 Swaps
        transaction = await token2.connect(investor2).approve(amm.address, tokens(100000))
        await transaction.wait()

        balance = await token1.balanceOf(investor2.address)
        console.log(`Investor 2 balance before swap: ${ethers.utils.formatEther(balance)}`)
        estimate = await amm.calculateToken2Swap(tokens(1))
        console.log(`Token1 received after swap: ${ethers.utils.formatEther(estimate)}`)
        transaction = await amm.connect(investor2).swapToken2(tokens(1))
        result = await transaction.wait()

        //Check that the event was emitted
        await expect(transaction).to.emit(amm, 'Swap').withArgs(
          investor2.address,
          token2.address,
          tokens(1),
          token1.address,
          estimate,
          await amm.token1Balance(),
          await amm.token2Balance(),
          (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp
        )

        balance = await token1.balanceOf(investor2.address)
        console.log(`Investor 2 balance of token1 after swap: ${ethers.utils.formatEther(balance)}\n`)
        expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
        expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

        console.log(`Price after ${await amm.token2Balance() / await amm.token1Balance()}\n`)

        //Investor2 swaps large amount
        balance = await token1.balanceOf(investor2.address)
        console.log(`Investor 2 balance before swap: ${ethers.utils.formatEther(balance)}`)
        estimate = await amm.calculateToken2Swap(tokens(10000))
        console.log(`Token1 received after swap: ${ethers.utils.formatEther(estimate)}`)
        transaction = await amm.connect(investor2).swapToken2(tokens(10000))
        result = await transaction.wait()
        
        balance = await token1.balanceOf(investor2.address)
        console.log(`Investor 2 balance of token1 after swap: ${ethers.utils.formatEther(balance)}\n`)
        expect(await token1.balanceOf(amm.address)).to.equal(await amm.token1Balance())
        expect(await token2.balanceOf(amm.address)).to.equal(await amm.token2Balance())

        console.log(`Price after ${await amm.token2Balance() / await amm.token1Balance()}\n`)

      })
      
    })
})
