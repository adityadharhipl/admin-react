import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for Refund Policy
const initialState = {
    title: null,
    content: null,
    status: 'idle',
    error: null,
};

// Async Thunks for Refund Policy

// Fetch Refund Policy
export const fetchRefundPolicy = createAsyncThunk(
    'refundPolicy/fetchRefundPolicy',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/refund_policy`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch Refund Policy content');
            const data = await response.json();
            
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Post Refund Policy
export const postRefundPolicy = createAsyncThunk(
    'refundPolicy/postRefundPolicy',
    async ({ key, title, content }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/refund_policy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ title, content, key }),
            });
            if (!response.ok) throw new Error('Failed to post Refund Policy content');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice for Refund Policy
const refundPolicySlice = createSlice({
    name: 'refundPolicy',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRefundPolicy.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRefundPolicy.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(fetchRefundPolicy.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(postRefundPolicy.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postRefundPolicy.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(postRefundPolicy.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default refundPolicySlice.reducer;
