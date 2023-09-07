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
            state.contract = action.payload
        },
        setBestExchange: (state, action) => {
            state.bestExchange = action.payload
        },
        setBestPrice: (state, action) => {
            state.bestPrice = action.payload
        }
    }
})

export const { setAggregatorContract, setBestExchange, setBestPrice } = aggregator.actions;

export default aggregator.reducer;