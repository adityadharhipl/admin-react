import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchSessionReport = createAsyncThunk(
  "sessionReport/fetchSessionReport",
  async ({ page, limit, startDate, endDate, search, searchType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");

      // Build params object based on searchType
      const params = { page, limit, startDate, endDate };

      if (search && searchType) {
        // Map searchType to backend parameter names
        const searchParamMap = {
          mobile: 'mobileNumber',
          astrologerName: 'astrologerName',
          userName: 'userName',
          sessionType: 'sessionType'
        };

        const backendParam = searchParamMap[searchType] || 'search';
        params[backendParam] = search;
      } else if (search) {
        // Fallback to generic search if no searchType
        params.search = search;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/sessionReport`,
        {
          params,
          headers: {
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
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
const SessionReportReducer = createSlice({
  name: "sessionReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSessionReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.paginationDetail = action.payload.paginationDetail;
        state.error = null;
      })
      .addCase(fetchSessionReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default SessionReportReducer.reducer;
