import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  queries: [],
  status: 'idle',
  loading: false,
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

// Fetch with pagination
export const fetchCustomerSupport = createAsyncThunk(
  'querySupport/fetchCustomerSupport',
  async ({ page = 1, limit = 10, search, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${process.env.REACT_APP_BASEURL}/admin/customerSupport?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer support queries');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete customer support
export const deleteCustomerSupport = createAsyncThunk(
  'customerSupport/deleteCustomerSupport',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/customerSupport/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete customer support data');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const querySupportSlice = createSlice({
  name: 'querySupport',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCustomerSupport.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchCustomerSupport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.queries = action.payload.data || [];
        state.pagination = action.payload.paginationDetail || initialState.pagination;
      })
      .addCase(fetchCustomerSupport.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCustomerSupport.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(deleteCustomerSupport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.queries = state.queries.filter(item => item._id !== action.payload); // or item.id if you use `id`
      })
      .addCase(deleteCustomerSupport.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default querySupportSlice.reducer;
