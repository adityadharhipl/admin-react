import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    instructors: [],
    status: 'idle',
    error: null,
    pagination: {
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    },
};

// Fetch Instructor Leads with Pagination
export const fetchInstructorLead = createAsyncThunk(
    'instructorLead/fetchInstructorLead',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/instructor?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch Instructor data');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Post Instructor Lead
export const postInstructorLead = createAsyncThunk(
    'instructorLead/postInstructorLead',
    async ({ name, email, phone }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/instructor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ name, email, phone }),
            });
            if (!response.ok) throw new Error('Failed to post Instructor data');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const instructorLeadSlice = createSlice({
    name: 'instructorLead',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchInstructorLead.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchInstructorLead.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.instructors = action.payload.data || [];
                state.pagination = action.payload.paginationDetail || initialState.pagination;
            })
            .addCase(fetchInstructorLead.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Post
            .addCase(postInstructorLead.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postInstructorLead.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.instructors.unshift(action.payload); 
            })
            .addCase(postInstructorLead.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default instructorLeadSlice.reducer;

