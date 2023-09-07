import { configureStore } from '@reduxjs/toolkit';

import provider from './reducers/provider';
import aggregator from './reducers/aggregator';

export const store = configureStore({
    reducer: {
        provider,
        aggregator
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export default store;
