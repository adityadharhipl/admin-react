import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCreditNotes = createAsyncThunk(
  "creditNotes/fetchCreditNotes",
  async ({ page, limit, search, startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/admin/creditNotes`,
        {
          params: { page, limit, search, startDate, endDate },
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
const CreditNotesReducer = createSlice({
  name: "creditNotes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditNotes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCreditNotes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.paginationDetail = action.payload.paginationDetail;
        state.error = null;
      })
      .addCase(fetchCreditNotes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default CreditNotesReducer.reducer;
