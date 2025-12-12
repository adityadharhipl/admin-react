import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
  services: [],
  status: 'idle',
  error: null,
};

// Create an async thunk for fetching data
export const editService = createAsyncThunk('services', async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BASEURL}/service?id=${id ?? ''}`);
  const data = await response.json();
  return data?.result;
});
export const fetchService = createAsyncThunk('services', async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BASEURL}/service?sellerId=${id ?? ''}`);
  const data = await response.json();
  return data;
});

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchService.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchService.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.services = action.payload;
      })
      .addCase(fetchService.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default serviceSlice.reducer;