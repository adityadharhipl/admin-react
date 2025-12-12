import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    title: null,
    content: null,
    status: 'idle',
    error: null,
};

// Async Thunks for Privacy Policy

// Fetch Privacy Policy
export const fetchPrivacyPolicy = createAsyncThunk(
    'privacyPolicy/fetchPrivacyPolicy',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/privacy_policy`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch Privacy Policy content');
            const data = await response.json();
            
            return data?.data;  
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Post Privacy Policy
export const postPrivacyPolicy = createAsyncThunk(
    'privacyPolicy/postPrivacyPolicy',
    async ({ key, title, content }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/privacy_policy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ title, content, key }),
            });
            if (!response.ok) throw new Error('Failed to post Privacy Policy content');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice for Privacy Policy
const privacyPolicySlice = createSlice({
    name: 'privacyPolicy',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrivacyPolicy.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPrivacyPolicy.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(fetchPrivacyPolicy.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(postPrivacyPolicy.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postPrivacyPolicy.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(postPrivacyPolicy.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default privacyPolicySlice.reducer;
