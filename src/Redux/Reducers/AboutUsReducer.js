import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Initial state
const initialState = {
    title: null,
    content: null,
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchAboutUs = createAsyncThunk(
    'aboutUs/fetchAboutUs',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/about_us`, {
                headers: {
                    'Authorization': token,
                },
            });
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }
            if (!response.ok) throw new Error('Failed to fetch About Us content');
            const data = await response.json();
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const postAboutUs = createAsyncThunk(
    'aboutUs/postAboutUs',
    async ({ key, title, content }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/staticPage/about_us`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ title, content, key }),
            });
            if (!response.ok) throw new Error('Failed to post About Us content');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const aboutUsSlice = createSlice({
    name: 'aboutUs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAboutUs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAboutUs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(fetchAboutUs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(postAboutUs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postAboutUs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.title = action.payload.title;
                state.content = action.payload.content;
            })
            .addCase(postAboutUs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default aboutUsSlice.reducer;
