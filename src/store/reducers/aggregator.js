import { createSlice } from '@reduxjs/toolkit';

export const aggregator = createSlice({
    name: 'aggregator',
    initialState: {
        contract: null,
        bestExchange: null
    },
    reducers: {
        setContract: (state, action) => {
            state.connection = action.payload
        },
        setBestExchange: (state, action) => {
            state.chainId = action.payload
        }
    }
})

export const { setContract, setBestExchange } = aggregator.actions;

export default aggregator.reducer;