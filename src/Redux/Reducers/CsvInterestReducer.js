import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const uploadFile = createAsyncThunk(
    'file/upload',
    async (file, { rejectWithValue }) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/interests/upload-file/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.detail || 'Upload Failed');
            } else {
                return { message: data.message };
            }

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Create slice
const fileSlice = createSlice({
    name: 'file',
    initialState: {
        uploadStatus: 'idle',
        uploadedFile: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadFile.pending, (state) => {
                state.uploadStatus = 'loading';
                state.error = null;
            })
            .addCase(uploadFile.fulfilled, (state, action) => {
                state.uploadStatus = 'succeeded';
                state.uploadedFile = action.payload;
                state.error = null;
            })
            .addCase(uploadFile.rejected, (state, action) => {
                state.uploadStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export default fileSlice.reducer;