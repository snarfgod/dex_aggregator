import { createSlice } from '@reduxjs/toolkit';

export const aggregator = createSlice({
    name: 'aggregator',
    initialState: {
        contract: null,
        bestExchange: null,
        bestPrice: null
    },
    reducers: {
        setAggregatorContract: (state, action) => {
            state.connection = action.payload
        },
        setBestExchange: (state, action) => {
            state.chainId = action.payload
        },
        setBestPrice: (state, action) => {
            state.account = action.payload
        }
    }
})

export const { setAggregatorContract, setBestExchange, setBestPrice } = aggregator.actions;

export default aggregator.reducer;