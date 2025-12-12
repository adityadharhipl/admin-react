import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
    subCategory: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchSubCategory = createAsyncThunk('subCategory', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/subcategory?id=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});

const subCategorySlice = createSlice({
    name: 'subCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSubCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Add the fetched products to the state
                state.subCategory = action.payload;
            })
            .addCase(fetchSubCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default subCategorySlice.reducer;