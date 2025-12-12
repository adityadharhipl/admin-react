import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Initial state
const initialState = {
  payoutDetails: [],
  status: 'idle',
  error: null,
  paginationDetail: {
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
    totalRecords: 0,
  },
  summary: {
    totalAmount: 0,
    earningAmount: 0,
    adminProfit: 0,
    tdsAmount: 0,
    amountAfterTds: 0,
  },
};


export const fetchPayoutDetails = createAsyncThunk(
  'payout/fetchPayoutDetails',
  async ({ page, limit, fromDate, toDate, search }, { rejectWithValue }) => {
    const token = localStorage.getItem('User-admin-token');
    if (!token) {
      return rejectWithValue('Authorization token not found');
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/payoutSummary`,
        {
          params: { page, limit, fromDate, toDate, search },
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please login again");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayoutDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPayoutDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payoutDetails = action.payload.data || [];
        state.paginationDetail = action.payload.paginationDetail || {
          currentPage: 1,
          perPage: 10,
          totalPages: 0,
          totalRecords: 0,
        };
        state.summary = action.payload.summary || {
          totalAmount: 0,
          earningAmount: 0,
          adminProfit: 0,
          tdsAmount: 0,
          amountAfterTds: 0,
        };
        state.error = null;
      })
      .addCase(fetchPayoutDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default payoutSlice.reducer;
