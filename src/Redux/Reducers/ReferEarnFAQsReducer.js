import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  referEarnFaqs: [],
  status: 'idle',
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

const token = localStorage.getItem("User-admin-token");

// Fetch Refer & Earn FAQs with pagination
export const fetchReferEarnFAQs = createAsyncThunk(
  'referEarnFaqs/fetch',
  async ({ page, limit  } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/faq?type=referEarn&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Refer & Earn FAQs');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create FAQ
export const createReferEarnFAQ = createAsyncThunk(
  'referEarnFaqs/create',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/referEarnFaq`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify(faqData),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to create FAQ');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update FAQ
export const updateReferEarnFAQ = createAsyncThunk(
  'referEarnFaqs/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/referEarnFaq/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update FAQ');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete FAQ
export const deleteReferEarnFAQ = createAsyncThunk(
  'referEarnFaqs/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/admin/referEarnFaq/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const referEarnFaqSlice = createSlice({
  name: 'referEarnFaqs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferEarnFAQs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReferEarnFAQs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.referEarnFaqs = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || initialState.pagination;
      })
      .addCase(fetchReferEarnFAQs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createReferEarnFAQ.fulfilled, (state, action) => {
        state.referEarnFaqs.unshift(action.payload);
      })
      .addCase(updateReferEarnFAQ.fulfilled, (state, action) => {
        const index = state.referEarnFaqs.findIndex(faq => faq._id === action.payload._id);
        if (index !== -1) state.referEarnFaqs[index] = action.payload;
      })
      .addCase(deleteReferEarnFAQ.fulfilled, (state, action) => {
        state.referEarnFaqs = state.referEarnFaqs.filter(faq => faq._id !== action.payload);
      });
  },
});

export default referEarnFaqSlice.reducer;

