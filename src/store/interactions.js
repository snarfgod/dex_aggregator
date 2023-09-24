import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setAggregatorContract,
  setRate,
  setAMM,
  balancesLoaded
} from './reducers/aggregator'

import AGGREGATOR_ABI from '../abis/Aggregator.json';

import config from '../config.json';
import WETH_ABI from '../abis/WETH.json';
import DAI_ABI from '../abis/DAI.json';
import MATIC_ABI from '../abis/MATIC.json';

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
export const loadAggregatorContract = async (provider, chainId, dispatch) => {
  const aggregator = new ethers.Contract(config[chainId].aggregator.address, AGGREGATOR_ABI, provider)

  dispatch(setAggregatorContract(aggregator))

  return aggregator
}

//Get rate from best AMM
export const getBestRate = async (dispatch, aggregator, inputToken, outputToken, amount) => {
  const [rate, AMM] = await aggregator.calculateBestRate(inputToken, outputToken, amount)
  dispatch(setRate(ethers.utils.formatUnits(rate, 18)))
  dispatch(setAMM(AMM))
  return [rate, AMM]
}

// Get Balances
export const loadBalances = async (dispatch, inputToken, outputToken, account, provider) => {
  let balance1, balance2
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  const MATIC = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
  const wethContract = new ethers.Contract(WETH, WETH_ABI, provider)
  const daiContract = new ethers.Contract(DAI, DAI_ABI, provider)
  const maticContract = new ethers.Contract(MATIC, MATIC_ABI, provider)

  if (inputToken === WETH) {
    balance1 = await wethContract.balanceOf(account)
  } else if (inputToken === DAI) {
    balance1 = await daiContract.balanceOf(account)
  } else if (inputToken === MATIC) {
    balance1 = await maticContract.balanceOf(account)
  }

  if (outputToken === WETH) {
    balance2 = await wethContract.balanceOf(account)
  } else if (outputToken === DAI) {
    balance2 = await daiContract.balanceOf(account)
  } else if (outputToken === MATIC) {
    balance2 = await maticContract.balanceOf(account)
  }
  balance1 = ethers.utils.formatUnits(balance1, 18)
  balance2 = ethers.utils.formatUnits(balance2, 18)
  dispatch(balancesLoaded([balance1, balance2]))
  return balance1, balance2
}

