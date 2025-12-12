import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';
const BASE_URL = process.env.REACT_APP_BASEURL;



const initialState = {
    giftAmounts: [],
    status: 'idle',
    error: null,
};
const getAuthToken = () => localStorage.getItem("User-admin-token");
export const fetchGiftAmounts = createAsyncThunk(
    'giftAmount/fetchGiftAmounts',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/giftAmount${id && `/${id}`}`, {
                headers: {
                    'Authorization': getAuthToken(),
                },
            });
            if (!response.ok) throw new Error('Failed to fetch gift amounts');
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }
            const data = await response.json();
            return data?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const postGiftAmount = createAsyncThunk(
    'giftAmount/postGiftAmount',
    async (giftAmountsArray, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/giftAmount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken(),
                },
                body: JSON.stringify(giftAmountsArray),
            });

            // ✅ Parse only once
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.message || 'Failed to create gift amount');
            }

            return result?.data;
        } catch (error) {
            console.error("postGiftAmount error:", error);
            return rejectWithValue(error.message || "Something went wrong while posting gift amount");
        }
    }
);

// 3. Update Multiple Gift Amounts (PATCH)
export const updateGiftAmount = createAsyncThunk(
    'giftAmount/updateGiftAmount',
    async ({ id, giftAmountsArray }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/giftAmount/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken(),
                },
                body: JSON.stringify(giftAmountsArray),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.message || 'Failed to update multiple gift amounts');
            }
            return result?.data;
        } catch (error) {
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

// 3. Update Position of Gift Amounts (PATCH)
export const updatePositionChange = createAsyncThunk(
    'giftAmount/updatePositionChange',
    async ({ id, giftAmountsArray }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/giftAmount/position/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken(),
                },
                body: JSON.stringify(giftAmountsArray),
            });

            // ✅ Parse JSON once and reuse it
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message || 'Failed to update multiple gift amounts');
            }
            return result?.data;
        } catch (error) {
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

// 4. Delete Gift Amount (DELETE)
export const deleteGiftAmount = createAsyncThunk(
    'giftAmount/deleteGiftAmount',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/giftAmount/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': getAuthToken(),
                },
            });
            if (!response.ok) throw new Error('Failed to delete gift amount');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ==============================
// Slice
// ==============================

const giftAmountSlice = createSlice({
    name: 'giftAmount',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchGiftAmounts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGiftAmounts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.giftAmounts = action.payload;
            })
            .addCase(fetchGiftAmounts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add
            .addCase(postGiftAmount.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postGiftAmount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.giftAmounts = [...state.giftAmounts, ...action.payload];
            })
            .addCase(postGiftAmount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update Multiple
            .addCase(updateGiftAmount.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateGiftAmount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedItems = action.payload;
                updatedItems.forEach(updated => {
                    const index = state.giftAmounts.findIndex(g => g._id === updated._id);
                    if (index !== -1) {
                        state.giftAmounts[index] = updated;
                    }
                });
            })
            .addCase(updateGiftAmount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteGiftAmount.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteGiftAmount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.giftAmounts = state.giftAmounts.filter(g => g._id !== action.payload);
            })
            .addCase(deleteGiftAmount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default giftAmountSlice.reducer;

