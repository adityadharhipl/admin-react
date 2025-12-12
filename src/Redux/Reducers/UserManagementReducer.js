import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

const initialState = {
  users: [],
  status: 'idle',
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

// Fetch Users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}) => {
    const token = localStorage.getItem('User-admin-token');
    
    const { page, limit, search, fullName, email, mobileNumber, startDate, endDate } = params;
    
    // Build query parameters dynamically
    const queryParams = new URLSearchParams({
      page: page?.toString() || '1',
      limit: limit?.toString() || '10',
    });

    // Add search parameters based on what's provided
    if (search) {
      queryParams.append('search', search);
    }
    if (fullName) {
      queryParams.append('fullName', fullName);
    }
    if (email) {
      queryParams.append('email', email);
    }
    if (mobileNumber) {
      queryParams.append('mobileNumber', mobileNumber);
    }
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/admin/user?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized: Please login again");
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data;
  }
);

// Add User
export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData) => {
    const token = localStorage.getItem('User-admin-token');

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/admin/user`,
      {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add user');
    }

    const data = await response.json();
    return data;
  }
);

// Users Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.data || [];
        state.pagination = action.payload.paginationDetail || initialState.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // ADD USER
      .addCase(addUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.unshift(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default usersSlice.reducer;

