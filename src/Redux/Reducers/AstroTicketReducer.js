import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

const initialState = {
  data: [],
  singleTicket: null,
  status: 'idle',
  error: null,
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

export const fetchAstroTickets = createAsyncThunk(
  'astroTicket/fetchAstroTickets',
  async ({ page = 1, limit = 10, status, userType, search, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      let url = `${process.env.REACT_APP_BASEURL}/admin/ticket?page=${page}&limit=${limit}${queryParams.toString() ? `&${queryParams.toString()}` : ''}`;
      if (status) url += `&status=${status}`;
      if (userType) url += `&userType=${userType}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Unauthorized: Please login again');
      }

      if (!response.ok) throw new Error('Failed to fetch ticket data');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSingleAstroTicket = createAsyncThunk(
  'astroTicket/fetchSingleAstroTicket',
  async ({ id, userType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');

      let url = `${process.env.REACT_APP_BASEURL}/admin/ticket/${id}`;
      if (userType) url += `?userType=${userType}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ticket data');
      const data = await response.json();
      return data?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteAstroTicket = createAsyncThunk(
  'astroTicket/deleteAstroTicket',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('User-admin-token');
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/ticket/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error('Failed to delete ticket');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const astroTicketSlice = createSlice({
  name: 'astroTicket',
  initialState,
  reducers: {
    resetSingleAstroTicket: (state) => {
      state.singleTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Paginated Tickets
      .addCase(fetchAstroTickets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAstroTickets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload?.data || [];
        state.pagination = action.payload?.paginationDetail || initialState.pagination;
      })
      .addCase(fetchAstroTickets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Ticket
      .addCase(fetchSingleAstroTicket.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSingleAstroTicket.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.singleTicket = action.payload;
      })
      .addCase(fetchSingleAstroTicket.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Ticket
      .addCase(deleteAstroTicket.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAstroTicket.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter((ticket) => ticket._id !== action.payload);
      })
      .addCase(deleteAstroTicket.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetSingleAstroTicket } = astroTicketSlice.actions;
export default astroTicketSlice.reducer;
