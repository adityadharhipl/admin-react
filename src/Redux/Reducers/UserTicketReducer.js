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

// Thunk: Fetch Paginated Tickets with optional status and userType
export const fetchUserTickets = createAsyncThunk(
    'userTicket/fetchUserTickets',
    async ({ page = 1, limit = 10, status, userType, search, startDate, endDate } = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (status) params.append('status', status);
            if (userType) params.append('userType', userType);
            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const url = `${process.env.REACT_APP_BASEURL}/admin/ticket?${params.toString()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': token,
                },
            });

            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }

            if (!response.ok) throw new Error('Failed to fetch ticket data');

            const data = await response.json();
            // console.log(data,"data")
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk: Fetch Single Ticket by ID
export const fetchSingleUserTicket = createAsyncThunk(
    'userTicket/fetchSingleUserTicket',
    async ({ id, userType }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");

            let url = `${process.env.REACT_APP_BASEURL}/admin/ticket/${id}`;
            if (userType) url += `?userType=${userType}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': token,
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

// Thunk: Delete Ticket by ID
export const deleteUserTicket = createAsyncThunk(
    'userTicket/deleteUserTicket',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/ticket/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
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
const userTicketSlice = createSlice({
    name: 'userTicket',
    initialState,
    reducers: {
        resetSingleUserTicket: (state) => {
            state.singleTicket = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Paginated Tickets
            .addCase(fetchUserTickets.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserTickets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload?.data || [];
                state.pagination = action.payload?.paginationDetail || initialState.pagination;
            })
            .addCase(fetchUserTickets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch Single Ticket
            .addCase(fetchSingleUserTicket.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSingleUserTicket.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.singleTicket = action.payload;
            })
            .addCase(fetchSingleUserTicket.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete Ticket
            .addCase(deleteUserTicket.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUserTicket.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = state.data.filter(ticket => ticket._id !== action.payload);
            })
            .addCase(deleteUserTicket.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetSingleUserTicket } = userTicketSlice.actions;

export default userTicketSlice.reducer;
