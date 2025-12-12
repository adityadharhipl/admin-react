import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Define the initial state
const initialState = {
    brand: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data 
export const fetchBrand = createAsyncThunk('brand', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/brand?sellerId=${id ?? ''}`);
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
    }
    const data = await response.json();
    return data;
});

export const editBrand = createAsyncThunk('brand', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/brand?id=${id ?? ''}`);
    const data = await response.json();
    return data;
});

const brandSlice = createSlice({
    name: 'brand',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrand.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBrand.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.brand = action.payload;
            })
            .addCase(fetchBrand.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    },
});

export default brandSlice.reducer;