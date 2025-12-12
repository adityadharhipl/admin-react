import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
    profile: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchProfile = createAsyncThunk('profile', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/seller_getdetail?id=${id ?? ''}`);
    const data = await response.json();
    return data?.result;
});

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Add the fetched profile to the state
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default profileSlice.reducer;