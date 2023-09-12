import { createSlice } from '@reduxjs/toolkit';

export const aggregator = createSlice({
    name: 'aggregator',
    initialState: {
        contract: null,
        bestRate: null
    },
    reducers: {
        setAggregatorContract: (state, action) => {
            state.contract = action.payload
        },
        setBestRate: (state, action) => {
            state.bestRate = action.payload
        }
    }
})

export const { setAggregatorContract, setBestRate } = aggregator.actions;

export default aggregator.reducer;