import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for Terms and Conditions
const initialState = {
    title: null,
    content: null,
    status: 'idle',
    error: null,
};

// Async Thunks for Terms and Conditions

// Fetch Terms and Conditions
export const fetchTermsConditions = createAsyncThunk(
    'termsConditions/fetchTermsConditions',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/terms_conditions`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch Terms and Conditions content');
            const data = await response.json();
            
            return data?.data;  
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Post Terms and Conditions
export const postTermsConditions = createAsyncThunk(
    'termsConditions/postTermsConditions',
    async ({ key, title, content }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/terms_conditions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ title, content, key }),
            });
            if (!response.ok) throw new Error('Failed to post Terms and Conditions content');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice for Terms and Conditions
const termsConditionsSlice = createSlice({
    name: 'termsConditions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTermsConditions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTermsConditions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(fetchTermsConditions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(postTermsConditions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postTermsConditions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(postTermsConditions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default termsConditionsSlice.reducer;
