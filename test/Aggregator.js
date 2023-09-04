const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Aggregator', function () {

    let accounts, deployer, token1, token2, amm1, amm2, aggregator, liquidityProvider, transaction, investor1, investor2, user1, quote

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        liquidityProvider = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]
        user1 = accounts[4]

        //Deploy and transfer tokens to liquidity provider and investors

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

        const AMM1 = await ethers.getContractFactory('AMM')
        amm1 = await AMM1.deploy(token1.address, token2.address)

        //Deploy and transfer tokens to second AMM

        const AMM2 = await ethers.getContractFactory('AMM')
        amm2 = await AMM2.deploy(token1.address, token2.address)

        //Deploy Aggregator

        const Aggregator = await ethers.getContractFactory('Aggregator')
        aggregator = await Aggregator.deploy(amm1.address, amm2.address)
    })

    describe('Deployment', async () => {

        it('Should deploy Aggregator', async () => {
            console.log('Aggregator deployed to:', aggregator.address);
            expect(aggregator.address).to.not.equal(0);
        });
        it('Should set AMMs', async () =>  {
            expect(await aggregator.amm1()).to.equal(amm1.address);
            expect(await aggregator.amm2()).to.equal(amm2.address);
        });
    });
    describe('Quotes', async () => {
        beforeEach(async() => {
            transaction = await token1.connect(liquidityProvider).approve(amm1.address, tokens(100000))
            await transaction.wait()

            transaction = await token2.connect(liquidityProvider).approve(amm1.address, tokens(100000))
            await transaction.wait()

            transaction = await token1.connect(liquidityProvider).approve(amm2.address, tokens(100000))
            await transaction.wait()

            transaction = await token2.connect(liquidityProvider).approve(amm2.address, tokens(100000))
            await transaction.wait()

            transaction = await amm1.connect(liquidityProvider).addLiquidity(tokens(1000), tokens(1000))
            await transaction.wait()

            transaction = await amm2.connect(liquidityProvider).addLiquidity(tokens(1000), tokens(1000))
            await transaction.wait()
        })
        it('Should return correct quote for user wanting token1', async () => {
            transaction = await aggregator.connect(user1).token1Quote(tokens(10))
            await transaction.wait()

            quote = await aggregator.bestPrice()

            expect(await aggregator.bestAMM()).to.equal(amm1.address);
            expect(ethers.utils.formatUnits(quote, 'ether')).to.equal('9.900990099009900991');
        });
        it('Should return correct quote for user wanting token2', async () => {
            transaction = await aggregator.connect(user1).token2Quote(tokens(10))
        });
        it('Should return lowest quote for user wanting token1', async () => {
            transaction = await amm1.connect(liquidityProvider).swapToken1(tokens(10))
            await transaction.wait()

            quote = await aggregator.connect(user1).token1Quote(tokens(10))
        });
    });
});