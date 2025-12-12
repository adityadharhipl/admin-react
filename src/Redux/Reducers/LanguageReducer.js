import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
  languages: [],
  status: 'idle',
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");

      const url = `${process.env.REACT_APP_BASEURL}/admin/language?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Post a new language
export const postLanguage = createAsyncThunk(
  'languages/postLanguage',
  async (languageName, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");

      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/language`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ languageName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add language');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const languageSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.languages = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || initialState.pagination;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    builder
      .addCase(postLanguage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(postLanguage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.languages.push(action.payload?.data); 
      })
      .addCase(postLanguage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default languageSlice.reducer;

