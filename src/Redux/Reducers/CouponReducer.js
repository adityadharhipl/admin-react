import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
    coupon: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const editCoupon = createAsyncThunk('coupon', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/coupon?id=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});

export const fetchCoupon = createAsyncThunk('coupon', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/coupon`);
    // const response = await fetch(`${process.env.REACT_APP_BASEURL}/coupon?sellerId=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});


const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoupon.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoupon.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.coupon = action.payload;
            })
            .addCase(fetchCoupon.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default couponSlice.reducer;