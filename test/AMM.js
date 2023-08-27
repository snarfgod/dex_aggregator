const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('AMM', () => {
    let accounts, deployer, token1, token2, amm, liquidityProvider, transaction

    beforeEach(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      liquidityProvider = accounts[1]

      const Token = await ethers.getContractFactory('Token')
      token1 = await Token.deploy('Snarfcoin', 'SNRF', '1000000')
      token2 = await Token.deploy('USDC', 'USDC', '1000000')

      transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
      await transaction.wait()

      transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
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
      let amount, transaction, result

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
      })
    })
})
