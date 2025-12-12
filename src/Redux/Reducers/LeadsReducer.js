import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  leads: [],
  status: 'idle',
  loading: false,
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  },
};

// Async thunk to fetch leads with pagination
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ page , limit }) => {
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/lead?page=${page}&limit=${limit}`);
    const data = await response.json();
    return data;
  }
);

// Slice
const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.leads = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || {
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          limit: 10,
        };
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default leadsSlice.reducer;
