import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Define the initial state
const initialState = {
    attribute: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchAttribute = createAsyncThunk('attribute', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/attribute?subCategoryId=${id ?? ''}`);
       if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized: Please login again");
          }
    const data = await response.json();
    return data?.result;
});

const attributeSlice = createSlice({
    name: 'attribute',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttribute.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAttribute.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.attribute = action.payload;
            })
            .addCase(fetchAttribute.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default attributeSlice.reducer;