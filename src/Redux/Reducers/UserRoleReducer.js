import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUsers = createAsyncThunk("user/fetchUsers", async ({ page, limit, search, startDate, endDate }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("User-admin-token");
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    if (startDate) {
      params.append('startDate', startDate);
    }

    if (endDate) {
      params.append('endDate', endDate);
    }

    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/adminUsers?${params.toString()}`, {
      headers: {
        Authorization: token,
      },
    });
    return {
      data: response.data?.data || [],
      paginationDetail: response.data?.paginationDetail || {},
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    pagination: {
      totalDocs: 0,
      totalPages: 1,
      page: 1,
      limit: 10,
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || state.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
