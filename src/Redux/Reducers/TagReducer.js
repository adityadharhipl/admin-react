import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
    tag: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchTag = createAsyncThunk('tag', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/tag?id=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});

const tagSlice = createSlice({
    name: 'tag',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTag.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTag.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tag = action.payload;
            })
            .addCase(fetchTag.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default tagSlice.reducer;