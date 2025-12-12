import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Define the initial state
const initialState = {
    users: [],
    status: 'idle',
    error: null,
};

// Create an async thunk for fetching data
export const fetchUsers = createAsyncThunk('users', async (id) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/user/profile/${id ?? ''}`);
     if (response.status === 401) {  
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }
    const data = await response.json();
    return data;
});

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default usersSlice.reducer;