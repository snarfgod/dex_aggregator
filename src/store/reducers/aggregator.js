import { createSlice } from '@reduxjs/toolkit';

export const aggregator = createSlice({
    name: 'aggregator',
    initialState: {
        contract: null,
        rate: 0,
        AMM: null,
        WETH_ABI: require("../../abis/WETH.json"),
        DAI_ABI: require("../../abis/DAI.json"),
        MATIC_ABI: require("../../abis/MATIC.json"),
        AMM_ABI: require("../../abis/IUniswapLike.json"),
        balances: [0, 0]
    },
    reducers: {
        setAggregatorContract: (state, action) => {
            state.contract = action.payload
        },
        setRate: (state, action) => {
            state.rate = action.payload
        },
        setAMM: (state, action) => {
            state.AMM = action.payload
        },
        balancesLoaded: (state, action) => {
            state.balances = action.payload
        }
    }
})

export const { setAggregatorContract, setRate, setAMM, balancesLoaded} = aggregator.actions;

export default aggregator.reducer;