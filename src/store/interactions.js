import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setContracts,
  setSymbols,
  balancesLoaded
} from './reducers/tokens'

import {
  setContract,
  sharesLoaded,
  swapsLoaded,
  depositRequest,
  depositSuccess,
  depositFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
  swapRequest,
  swapSuccess,
  swapFail
} from './reducers/amm'

import {
  setContract as setAggregatorContract,
  setBestExchange
} from './reducers/aggregator'

import TOKEN_ABI from '../abis/Token.json';
import AMM_ABI from '../abis/AMM.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';
import config from '../config.json';

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  dispatch(setProvider(provider))

  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId))

  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

// Load contracts
export const loadTokens = async (provider, chainId, dispatch) => {
  const snarfcoin = new ethers.Contract(config[chainId].snarfcoin.address, TOKEN_ABI, provider)
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

  dispatch(setContracts([snarfcoin, usd]))
  dispatch(setSymbols([await snarfcoin.symbol(), await usd.symbol()]))
}

export const loadAMM = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].amm.address, AMM_ABI, provider)

  dispatch(setContract(amm))

  return amm
}

export const loadAMM2 = async (provider, chainId, dispatch) => {
  const amm2 = new ethers.Contract(config[chainId].amm2.address, AMM_ABI, provider)

  dispatch(setContract(amm2))

  return amm2
}

export const loadAggregator = async (provider, chainId, dispatch) => {
  const aggregator = new ethers.Contract(config[chainId].aggregator.address, AGGREGATOR_ABI, provider)

  dispatch(setAggregatorContract(aggregator))

  return aggregator
}

  // Load balances and shares
export const loadBalances = async (amm, tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account)
  const balance2 = await tokens[1].balanceOf(account)

  dispatch(balancesLoaded([
    ethers.utils.formatUnits(balance1.toString(), 'ether'),
    ethers.utils.formatUnits(balance2.toString(), 'ether')
  ]))

  const shares = await amm.shares(account)
  dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')))
}


// Add liquidity
export const addLiquidity = async (provider, amm, tokens, amounts, dispatch) => {
  try {
    dispatch(depositRequest())

    const signer = await provider.getSigner()

    let transaction

    transaction = await tokens[0].connect(signer).approve(amm.address, amounts[0])
    await transaction.wait()

    transaction = await tokens[1].connect(signer).approve(amm.address, amounts[1])
    await transaction.wait()

    transaction = await amm.connect(signer).addLiquidity(amounts[0], amounts[1])
    await transaction.wait()

    dispatch(depositSuccess(transaction.hash))
  } catch (error) {
    dispatch(depositFail())
  }
}

// Remove liquidity

export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  try {
    dispatch(withdrawRequest())

    const signer = await provider.getSigner()

    let transaction = await amm.connect(signer).removeLiquidity(shares)
    await transaction.wait()

    dispatch(withdrawSuccess(transaction.hash))
  } catch (error) {
    dispatch(withdrawFail())
  }
}

// Swap tokens

export const swap = async (provider, amm, token, symbol, amount, dispatch) => {
  try {

    dispatch(swapRequest())

    let transaction

    const signer = await provider.getSigner()

    transaction = await token.connect(signer).approve(amm.address, amount)
    await transaction.wait()

    if (symbol === "SNRF") {
      transaction = await amm.connect(signer).swapToken1(amount)
    } else {
      transaction = await amm.connect(signer).swapToken2(amount)
    }

    await transaction.wait()

    dispatch(swapSuccess(transaction.hash))

  } catch (error) {
    dispatch(swapFail())
  }
}

// Load all swaps

export const loadAllSwaps = async (provider, amm, dispatch) => {
  const block = await provider.getBlockNumber()

  const swapStream = await amm.queryFilter('Swap', 0, block)
  const swaps = swapStream.map(event => {
    return { hash: event.transactionHash, args: event.args }
  })

  dispatch(swapsLoaded(swaps))
}

// Load best exchange

export const loadBestExchangeToken1 = async (aggregator, amount, dispatch) => {
  let [bestExchange, bestPrice] = await aggregator.token1Quote(amount)

  dispatch(setBestExchange(bestExchange))
}
