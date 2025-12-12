import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const token = localStorage.getItem("User-admin-token");

const config = {
  headers: {
    Authorization: token,
    "Content-Type": "application/json",
  },
};

export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async ({ page, limit, search, startDate, endDate }, { rejectWithValue }) => {
    try {
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

      const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/role?${params.toString()}`, config);
      console.log("Fetched roles:", res.data);
      return {
        data: res.data?.data || [],
        paginationDetail: res.data?.paginationDetail || {},
      };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch roles");
    }
  }
);

export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_BASEURL}/admin/role/${id}`, formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update role");
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState: {
    roles: [],
    loading: false,
    error: null,
    pagination: {
      totalDocs: 0,
      totalPages: 1,
      page: 1,
      limit: 10,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || state.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roleSlice.reducer;
