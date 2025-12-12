import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  aiAstroData: [],
  pagination: {
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

// Async thunk for fetching AI Astrologers
export const fetchAIAstro = createAsyncThunk(
  'aiAstro/fetchAIAstro',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer`,
        {
          params: { page, limit, search },
          headers: { Authorization: token },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching single AI Astrologer
export const fetchAIAstroById = createAsyncThunk(
  'aiAstro/fetchAIAstroById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
        {
          headers: { Authorization: token },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for creating AI Astrologer
export const createAIAstro = createAsyncThunk(
  'aiAstro/createAIAstro',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer`,
        data,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for updating AI Astrologer
export const updateAIAstro = createAsyncThunk(
  'aiAstro/updateAIAstro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.patch(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
        data,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting AI Astrologer
export const deleteAIAstro = createAsyncThunk(
  'aiAstro/deleteAIAstro',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.delete(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
        {
          headers: { Authorization: token },
        }
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for toggling active status
export const toggleAIAstroActive = createAsyncThunk(
  'aiAstro/toggleAIAstroActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.patch(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}/toggle-active`,
        { isActive },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for toggling online status
export const toggleAIAstroOnline = createAsyncThunk(
  'aiAstro/toggleAIAstroOnline',
  async ({ id, isOnline }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await axios.patch(
        `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}/toggle-online`,
        { isOnline },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const aiAstrologerSlice = createSlice({
  name: 'aiAstrologer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch AI Astrologers
      .addCase(fetchAIAstro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIAstro.fulfilled, (state, action) => {
        state.loading = false;
        state.aiAstroData = action.payload.data || [];
        state.pagination = {
          totalDocs: action.payload.totalDocs || 0,
          limit: action.payload.limit || 10,
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchAIAstro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch AI Astrologer by ID
      .addCase(fetchAIAstroById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIAstroById.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchAIAstroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create AI Astrologer
      .addCase(createAIAstro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAIAstro.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.aiAstroData.unshift(action.payload.data);
        }
      })
      .addCase(createAIAstro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update AI Astrologer
      .addCase(updateAIAstro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAIAstro.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.aiAstroData.findIndex(
          (item) => item._id === action.payload.data?._id
        );
        if (index !== -1 && action.payload.data) {
          state.aiAstroData[index] = action.payload.data;
        }
      })
      .addCase(updateAIAstro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete AI Astrologer
      .addCase(deleteAIAstro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAIAstro.fulfilled, (state, action) => {
        state.loading = false;
        state.aiAstroData = state.aiAstroData.filter(
          (item) => item._id !== action.payload.id
        );
        state.pagination.totalDocs -= 1;
      })
      .addCase(deleteAIAstro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Active Status
      .addCase(toggleAIAstroActive.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAIAstroActive.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.aiAstroData.findIndex(
          (item) => item._id === action.payload.data?._id
        );
        if (index !== -1 && action.payload.data) {
          state.aiAstroData[index] = action.payload.data;
        }
      })
      .addCase(toggleAIAstroActive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Online Status
      .addCase(toggleAIAstroOnline.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAIAstroOnline.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.aiAstroData.findIndex(
          (item) => item._id === action.payload.data?._id
        );
        if (index !== -1 && action.payload.data) {
          state.aiAstroData[index] = action.payload.data;
        }
      })
      .addCase(toggleAIAstroOnline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = aiAstrologerSlice.actions;
export default aiAstrologerSlice.reducer;

