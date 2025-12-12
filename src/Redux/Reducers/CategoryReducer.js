import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';
const initialState = {
    category: [],
    status: 'idle',
    loading: false,
    error: null,
    pagination: {
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    },
};


export const fetchCategory = createAsyncThunk(
    'category/fetch',
    async ({ page, limit } = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");

            const url = typeof page !== "undefined" && typeof limit !== "undefined"
                ? `${process.env.REACT_APP_BASEURL}/admin/category?page=${page}&limit=${limit}`
                : `${process.env.REACT_APP_BASEURL}/admin/category`;



            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 401) {  
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }

            if (!response.ok) {
                throw new Error('Failed to fetch category');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategory.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.category = action.payload?.data || [];
                state.pagination = action.payload?.paginationDetail || initialState.pagination;
            })
            .addCase(fetchCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default categorySlice.reducer;
