import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';
const initialState = {
  astroData: [],
  editableAstroData: [],
  selectedAstro: null,
  status: 'idle',
  error: null,
  editablePagination: {
  totalDocs: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
},
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

export const fetchAstro = createAsyncThunk(
  'astro/fetchAstro',
  async ({ page, limit , search = '', status="" }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/${(status === "active") ? 'getAllAstroVerified' : "getAstroUnVerified"}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        {
          // Removed Authorization header to bypass user-based filtering
        }
      );

      if (!response.ok) throw new Error('Failed to fetch astrologers');
      const data = await response.json();

      return data;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch astrologer by ID
export const fetchAstroById = createAsyncThunk(
  "astro/fetchAstroById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/getAstro/${id}`, {
        method: "GET",
        // Removed Authorization header
      });

      if (!response.ok) {
        return rejectWithValue(data?.message || "Something went wrong");
      }
      const data = await response.json();
      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create astrologer
export const postAstro = createAsyncThunk(
  'astro/postAstro',
  async (astroPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/addAstro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Removed Authorization header
        },
        body: JSON.stringify(astroPayload),
      });

      const data = await response.json(); // ✅ parse before using
      if (!response.ok) {
        return rejectWithValue(data?.message || "Something went wrong");
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);


// Update astrologer
export const updateAstro = createAsyncThunk(
  'astro/updateAstro',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/updateAstro/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Removed Authorization header
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json(); // ✅ always parse
      if (!response.ok) {
        return rejectWithValue(data?.message || "Something went wrong");
      }

      return { id, data: data.data };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Verify astrologer
export const verifyAstro = createAsyncThunk(
  'astro/verifyAstro',
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/astroProfileVerify/${id}`, {
        method: 'POST',
        // Removed Authorization header
      });

      if (!response.ok) throw new Error('Failed to verify astrologer');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAstroUpdateRequest = createAsyncThunk(
  'astro/fetchAstroUpdateRequest',
  async ({ page, limit, search = '', }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/getAstroUpdateRequests?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        {
          // Removed Authorization header
        }
      );
      if (!response.ok) throw new Error('Failed to fetch update requests');
      const data = await response.json();
      return {
        data: data?.data || [],
        pagination: data?.paginationDetail || {
          totalDocs: 0,
          totalPages: 1,
          page,
          limit,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);




// Delete astrologer
export const deleteAstro = createAsyncThunk(
  'astro/deleteAstro',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/deleteAstro/${id}`, {
        method: 'DELETE',
        // Removed Authorization header
      });
      if (!response.ok) throw new Error('Failed to delete astrologer');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const astroSlice = createSlice({
  name: 'astro',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all astrologers
      // Fetch all astrologers
      .addCase(fetchAstro.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAstro.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.astroData = action.payload.data;
        state.pagination = action.payload.paginationDetail || initialState.pagination;
      })
      .addCase(fetchAstro.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch astrologer by ID
      .addCase(fetchAstroById.fulfilled, (state, action) => {
        state.selectedAstro = action.payload || null;
      })
      .addCase(fetchAstroById.rejected, (state, action) => {
        state.selectedAstro = null;
        state.error = action.payload;
      })

      // Create astrologer
      .addCase(postAstro.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.astroData.push(action.payload);
      })
      .addCase(postAstro.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      .addCase(fetchAstroUpdateRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAstroUpdateRequest.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.editableAstroData = action.payload.data;
  state.editablePagination = action.payload.pagination || state.editablePagination;
})


      .addCase(fetchAstroUpdateRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update astrologer
      .addCase(updateAstro.fulfilled, (state, action) => {
        const index = state.astroData.findIndex((astro) => astro._id === action.payload.id);
        if (index !== -1) {
          state.astroData[index] = { ...state.astroData[index], ...action.payload.data };
        }
        if (state.selectedAstro && state.selectedAstro._id === action.payload.id) {
          state.selectedAstro = { ...state.selectedAstro, ...action.payload.data };
        }
      })
      .addCase(updateAstro.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Verify astrologer
      .addCase(verifyAstro.fulfilled, (state, action) => {
        const index = state.astroData.findIndex((astro) => astro._id === action.payload);
        if (index !== -1) {
          state.astroData[index].isProfileVerified = !state.astroData[index].isProfileVerified;
        }
      })
      .addCase(verifyAstro.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete astrologer
      .addCase(deleteAstro.fulfilled, (state, action) => {
        state.astroData = state.astroData.filter((astro) => astro._id !== action.payload);
      })
      .addCase(deleteAstro.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default astroSlice.reducer;




