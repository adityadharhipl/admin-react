import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { handleUnauthorized } from '../../TokenAuth/auth';


export const fetchRechargeReport = createAsyncThunk(
  "CallAndChatReducer/fetchRechargeReport",
  async ({ page, limit, startDate, endDate, search, searchType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");

      // Build params object based on searchType
      const params = { page, limit, startDate, endDate };
      
      if (search && searchType) {
        // Map searchType to backend parameter names
        const searchParamMap = {
          userName: 'userName',
          mobileNumber: 'mobileNumber',
          invoiceNumber: 'invoiceNumber',
          paymentStatus: 'paymentStatus'
        };
        
        const backendParam = searchParamMap[searchType] || 'search';
        params[backendParam] = search;
      } else if (search) {
        // Fallback to generic search if no searchType
        params.search = search;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/rechargeReport`,
        {
          params,
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
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

// Initial state
const initialState = {
  data: [],
  totalCount: 0,
  status: "idle",
  error: null,
  paginationDetail: {
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
    totalRecords: 0,
  },
};

// Slice
const CallAndChatReducer = createSlice({
  name: "CallAndChatReducer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRechargeReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRechargeReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.paginationDetail = action.payload.paginationDetail;
        state.error = null;
      })
      .addCase(fetchRechargeReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default CallAndChatReducer.reducer;
