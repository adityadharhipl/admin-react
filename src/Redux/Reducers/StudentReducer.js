import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial State
const initialState = {
    students: [],
    status: 'idle',
    error: null,
    pagination: {
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    },
};

// Fetch Students with Pagination
export const fetchStudent = createAsyncThunk(
    'students/fetchStudent',
    async ({ page , limit  }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/enrollment?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch student data');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const studentSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStudent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.students = action.payload.data || [];
                state.pagination = action.payload.paginationDetail || initialState.pagination;
            })
            .addCase(fetchStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default studentSlice.reducer;
