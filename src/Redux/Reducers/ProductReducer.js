import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState = {
  products: [],
  status: 'idle',
  error: null,
};

// Create an async thunk for fetching data
export const editProducts = createAsyncThunk('products', async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BASEURL}/product?id=${id ?? ''}`);
  const data = await response.json();
  return data?.result;
});

export const fetchProducts = createAsyncThunk('products', async (id) => {
  const response = await fetch(`${process.env.REACT_APP_BASEURL}/product?sellerId=${id ?? ''}`);
  const data = await response.json();
  return data?.result;
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;