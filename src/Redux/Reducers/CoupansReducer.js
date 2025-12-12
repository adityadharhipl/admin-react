import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';

// Initial state
const initialState = {
  coupons: [],
  status: 'idle',
  error: null,
};

// Fetch Coupons (GET)
export const fetchCoupons = createAsyncThunk('coupons/fetchCoupons', async ({ page, limit }) => {
  const token = localStorage.getItem("User-admin-token");

  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon?page=${page}&limit${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized: Please login again");
  }

  if (!response.ok) {
    throw new Error('Failed to fetch coupons');
  }

  const data = await response.json();
  return data;
});

// Create Coupon (POST)
export const postCoupon = createAsyncThunk('coupons/postCoupon', async (couponData) => {
  const token = localStorage.getItem("User-admin-token");

  const { type } = couponData;
  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon`, {
    method: 'POST',
    headers: {
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...couponData,
      type: type,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add coupon');
  }

  const data = await response.json();
  return data;
});

// Update Coupon (PUT)
export const updateCoupon = createAsyncThunk('coupons/updateCoupon', async ({ id, couponData }) => {
  const token = localStorage.getItem("User-admin-token");

  const { type } = couponData;

  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...couponData,
      type: type,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update coupon');
  }

  const data = await response.json();
  return data;
});

// Delete Coupon (DELETE)
export const deleteCoupon = createAsyncThunk('coupons/deleteCoupon', async (id) => {
  const token = localStorage.getItem("User-admin-token");

  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/coupon/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': ` ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete coupon');
  }

  return id;
});

// Slice
const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    builder
      .addCase(postCoupon.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(postCoupon.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coupons.push(action.payload);  // Add new coupon to the list
      })
      .addCase(postCoupon.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    builder
      .addCase(updateCoupon.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCoupon = action.payload;
        const index = state.coupons.findIndex(coupon => coupon.id === updatedCoupon.id);
        if (index >= 0) {
          state.coupons[index] = updatedCoupon;  // Update coupon in the list
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    builder
      .addCase(deleteCoupon.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coupons = state.coupons.filter(coupon => coupon.id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default couponsSlice.reducer;
