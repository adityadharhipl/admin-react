import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    interests: [],
    status: 'idle',
    error: null,
};


export const fetchInterests = createAsyncThunk('interests', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/interests/?category_id=${id ?? ''}?page=1&size=100`);
    const data = await response.json();
    return data;
});

const interestsSlice = createSlice({
    name: 'interests',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInterests.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchInterests.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.interests = action.payload;
            })
            .addCase(fetchInterests.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default interestsSlice.reducer;