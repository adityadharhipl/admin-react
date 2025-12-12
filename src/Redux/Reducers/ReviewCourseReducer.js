import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
  review: [],
  status: 'idle',
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};
export const fetchReview = createAsyncThunk(
  'review/fetchReview',
  async ({ page, limit, search,startDate,endDate }, { rejectWithValue }) => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/feedbacks?page=${page}&limit=${limit}${queryParams.toString() ? `&${queryParams.toString()}` : ''}`, {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Verify astrologer
export const verifyReviews = createAsyncThunk(
  'astro/verifyReviews',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/feedbackUpdate/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',  // ✅ important
        },
        body: JSON.stringify({ status }),       // ✅ send JSON object
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Failed to verify review: ${errData}`);
      }

      const data = await response.json();
      return data; // you can return updated review or id
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReview.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // If fetched by id, return as single object inside array, else paginated list
        if (action.meta.arg.id) {
          state.review = action.payload.data ? [action.payload.data] : [];
          state.pagination = initialState.pagination;
        } else {
          state.review = action.payload.data || [];
          state.pagination = action.payload.paginationDetail || initialState.pagination;
        }
      })
      .addCase(fetchReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;

