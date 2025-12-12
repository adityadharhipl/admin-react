import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for query
const initialState = {
    data: [],
    status: 'idle',
    error: null,
    pagination: {
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    },
};

// Thunk to fetch query data
export const fetchQuery = createAsyncThunk(
    'query/fetchQuery',
    async ({ page = 1, limit = 10, search, startDate, endDate } = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const url = `${process.env.REACT_APP_BASEURL}/admin/query?${params.toString()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch query data');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk to delete query data
export const deleteQuery = createAsyncThunk(
    'query/deleteQuery',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/query/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to delete query');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const querySlice = createSlice({
    name: 'query',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(fetchQuery.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload?.data || [];
                state.pagination = action.payload?.paginationDetail || initialState.pagination;
            })
            .addCase(fetchQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })


            .addCase(deleteQuery.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = state.data.filter(item => item._id !== action.payload);
            })
            .addCase(deleteQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default querySlice.reducer;
