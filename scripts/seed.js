// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
const shares = ether

async function main() {
    console.log(`Fetching accounts and network...\n`)
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    const {chainId} = await ethers.provider.getNetwork()
    
    const snarfcoin = await ethers.getContractAt('Token', config[chainId].snarfcoin.address)
    const usd = await ethers.getContractAt('Token', config[chainId].usd.address)
    const amm = await ethers.getContractAt('AMM', config[chainId].amm.address)
    const amm2 = await ethers.getContractAt('AMM', config[chainId].amm2.address)
    const aggregator = await ethers.getContractAt('Aggregator', config[chainId].aggregator.address)

    console.log(`Snarfcoin fetched at: ${snarfcoin.address}\n`)
    console.log(`USD fetched at: ${usd.address}\n`)
    console.log(`AMM fetched at: ${amm.address}\n`)
    console.log(`AMM2 fetched at: ${amm2.address}\n`)
    console.log(`Aggregator fetched at: ${aggregator.address}\n`)

    //Distribute tokens to investors
    console.log(`Distributing tokens to investors...\n`)
    let transaction
    transaction = await snarfcoin.connect(deployer).transfer(investor1.address, tokens(10))
    await transaction.wait()
    transaction = await usd.connect(deployer).transfer(investor2.address, tokens(10))
    await transaction.wait()
    transaction = await snarfcoin.connect(deployer).transfer(investor3.address, tokens(10))
    await transaction.wait()
    transaction = await usd.connect(deployer).transfer(investor4.address, tokens(10))
    await transaction.wait()
    console.log(`Tokens distributed to investors!\n`)

    //Add liquidity
    console.log(`Approving and adding liquidity...\n`)
    let amount = tokens(100)
    transaction = await snarfcoin.connect(deployer).approve(amm.address, amount)
    await transaction.wait()
    transaction = await usd.connect(deployer).approve(amm.address, amount)
    await transaction.wait()
    transaction = await amm.connect(deployer).addLiquidity(amount, amount)
    await transaction.wait()
    console.log(`Liquidity added!\n`)

    //Swap tokens
    console.log(`Swapping tokens...\n`)
    transaction = await snarfcoin.connect(investor1).approve(amm.address, tokens(10))
    await transaction.wait()
    transaction = await amm.connect(investor1).swapToken1(tokens(1))
    await transaction.wait()

    transaction = await usd.connect(investor2).approve(amm.address, tokens(10))
    await transaction.wait()
    transaction = await amm.connect(investor2).swapToken2(tokens(1))
    await transaction.wait()

    transaction = await snarfcoin.connect(investor3).approve(amm.address, tokens(10))
    await transaction.wait()
    transaction = await amm.connect(investor3).swapToken1(tokens(10))
    await transaction.wait()

    transaction = await usd.connect(investor4).approve(amm.address, tokens(5))
    await transaction.wait()
    console.log(`Tokens swapped!\n`)

    //Doing everything again for the second exchange

    //Add liquidity
    console.log(`Approving and adding liquidity for the second exchange...\n`)
    transaction = await snarfcoin.connect(deployer).approve(amm2.address, amount)
    await transaction.wait()
    transaction = await usd.connect(deployer).approve(amm2.address, amount)
    await transaction.wait()
    transaction = await amm2.connect(deployer).addLiquidity(amount, amount)
    await transaction.wait()
    console.log(`Liquidity added!\n`)

    //Swap tokens
    console.log(`Swapping tokens...\n`)
    transaction = await snarfcoin.connect(investor1).approve(amm2.address, tokens(10))
    await transaction.wait()
    transaction = await amm2.connect(investor1).swapToken1(tokens(1))
    await transaction.wait()

    transaction = await usd.connect(investor2).approve(amm2.address, tokens(10))
    await transaction.wait()
    transaction = await amm2.connect(investor2).swapToken2(tokens(1))
    await transaction.wait()

    transaction = await snarfcoin.connect(investor3).approve(amm2.address, tokens(10))
    await transaction.wait()
    transaction = await amm2.connect(investor3).swapToken1(tokens(10))
    await transaction.wait()

    transaction = await usd.connect(investor4).approve(amm2.address, tokens(5))
    await transaction.wait()
    console.log(`Tokens swapped!\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
