import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    callbackfeedback: [],
    status: 'idle',
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        totalDocs: 0,
        totalPages: 1,
    }
};

const token = localStorage.getItem("User-admin-token");

export const fetchCallbackFeedbacks = createAsyncThunk(
    'callbackfeedback/fetchCallbackFeedbacks',
    async ({ page , limit } = {}, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/userRequests?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch Callback Feedbacks');

            const data = await response.json();
            return data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete a specific callback feedback
export const deleteCallbackFeedback = createAsyncThunk(
    'callbackfeedback/deleteCallbackFeedback',
    async ({ id, callback }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/userRequests/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete Callback Feedback');

            callback && callback(null, id);
            return id;
        } catch (error) {
            callback && callback(error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const callbackFeedbackSlice = createSlice({
    name: 'callbackfeedback',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCallbackFeedbacks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCallbackFeedbacks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.callbackfeedback = action.payload?.data || [];
                state.pagination = action.payload?.paginationDetail || initialState.pagination;
            })
            .addCase(fetchCallbackFeedbacks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteCallbackFeedback.fulfilled, (state, action) => {
                state.callbackfeedback = state.callbackfeedback.filter(
                    (feedback) => feedback._id !== action.payload
                );
            })
            .addCase(deleteCallbackFeedback.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default callbackFeedbackSlice.reducer;

