import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Define the initial state
const initialState = {
    commission: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchCommission = createAsyncThunk('commission', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/commission?sellerId=${id ?? ''}`);
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
    }
    const data = await response.json();

    return data?.result;
});

export const editCommission = createAsyncThunk('commission', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/commission?id=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});

const commissionSlice = createSlice({
    name: 'commission',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommission.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCommission.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Add the fetched products to the state
                state.commission = action.payload;
            })
            .addCase(fetchCommission.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default commissionSlice.reducer;