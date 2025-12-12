import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

const initialState = {
    banner:[],
    status: 'idle',
    error: null,
};

export const fetchBanner = createAsyncThunk('banner/fetch', async () => {
    const token = localStorage.getItem("User-admin-token"); 

    const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/banner`, {
        method: "GET",
        headers: {
            'Authorization': `${token}`,  
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch banners');
    }
   if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
      }
    const data = await response.json();

    return data;
});

const bannerSlice = createSlice({
    name: 'banner',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBanner.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBanner.fulfilled, (state, action) => {
                       state.status = 'succeeded';
                      state.banner = action.payload?.data ||[];
               
                
            })
            .addCase(fetchBanner.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default bannerSlice.reducer;
