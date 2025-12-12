import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleUnauthorized } from '../../TokenAuth/auth';
const initialState = {
    offers: [],
    status: 'idle',
    error: null,
    pagination: {
        totalDocs: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    },
};

export const fetchOffers = createAsyncThunk(
    'offer/fetchOffers',
    async ({ page, limit, search, startDate, endDate }, { rejectWithValue }) => {
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

            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/offer?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                },
            });

            if (response.status === 401) {
                handleUnauthorized();
                throw new Error("Unauthorized: Please login again");
            }
            if (!response.ok) throw new Error('Failed to fetch offers');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Post Offer
export const postOffer = createAsyncThunk(
    'offer/postOffer',
    async ({ offerTitle, applicableValue, discountType, offerType, astrologers, offerImage }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ offerTitle, applicableValue, discountType, offerType, astrologers, offerImage }),
            });
            if (!response.ok) throw new Error('Failed to create offer');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Offer
export const deleteOffer = createAsyncThunk(
    'offer/deleteOffer',
    async (offerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("User-admin-token");
            const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/offer/${offerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                }
            });
            if (!response.ok) throw new Error('Failed to delete offer');
            return offerId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Offers
            .addCase(fetchOffers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.offers = action.payload.data || [];
                state.pagination = action.payload.paginationDetail || initialState.pagination;
            })
            .addCase(fetchOffers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Post Offer
            .addCase(postOffer.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(postOffer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.offers.unshift(action.payload); // Add to top
            })
            .addCase(postOffer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete Offer
            .addCase(deleteOffer.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteOffer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.offers = state.offers.filter(offer => offer._id !== action.payload);
            })
            .addCase(deleteOffer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default offerSlice.reducer;

