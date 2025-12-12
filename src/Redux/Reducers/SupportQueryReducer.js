import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    queries: [], 
    status: 'idle', 
    loading: false, 
    error: null, 
};


export const fetchCustomerSupport = createAsyncThunk(
    'querySupport/fetchCustomerSupport',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token"); 
            const response = await fetch(
                `${process.env.REACT_APP_BASEURL}/admin/customerSupport`,
                {
                    headers: {
                        Authorization: token, 
                    },
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch customer support queries');
            }
            const data = await response.json();
           
            return data;
        } catch (error) {
            return rejectWithValue(error.message); 
        }
    }
);

// Create the slice
const querySupportSlice = createSlice({
    name: 'querySupport',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomerSupport.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchCustomerSupport.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.queries = action.payload; 
            })
            .addCase(fetchCustomerSupport.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload; 
            });
    },
});


export default querySupportSlice.reducer;
