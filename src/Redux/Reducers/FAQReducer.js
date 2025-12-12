import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  genericFAQs: [],
  courseFAQs: [],
  status: 'idle',
  error: null,
  paginationGeneric: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
  paginationCourse: {
    totalDocs: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

// Fetch generic FAQs with pagination
// export const fetchGenericFAQs = createAsyncThunk(
//   'faq/fetchGenericFAQs',
//   async ({ page , limit } = {}, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("User-admin-token");
//       const url = `${process.env.REACT_APP_BASEURL}/admin/faq?type=generic&page=${page}&limit=${limit}`;

//       const response = await fetch(url, {
//         headers: { Authorization: token },
//       });

//       if (!response.ok) throw new Error('Failed to fetch generic FAQs');
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGenericFAQs = createAsyncThunk(
  'faq/fetchGenericFAQs',
  async ({ page = 1, limit = 10, forValue = "user" }) => {
    const token = localStorage.getItem("User-admin-token");
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/faq?type=generic&page=${page}&limit=${limit}&for=${forValue}`, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    });
    const data = await response.json();
    return data;
  }
);


// Fetch course FAQs with pagination
export const fetchCourseFAQs = createAsyncThunk(
  'faq/fetchCourseFAQs',
  async ({ page , limit } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("User-admin-token");
      const url = `${process.env.REACT_APP_BASEURL}/admin/faq?type=course&page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        headers: { Authorization: token },
      });

      if (!response.ok) throw new Error('Failed to fetch course FAQs');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Generic FAQs
      .addCase(fetchGenericFAQs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGenericFAQs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.genericFAQs = action.payload.data || [];
        state.paginationGeneric = action.payload.paginationDetail || initialState.paginationGeneric;
      })
      .addCase(fetchGenericFAQs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Course FAQs
      .addCase(fetchCourseFAQs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourseFAQs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courseFAQs = action.payload.data || [];
        state.paginationCourse = action.payload.paginationDetail || initialState.paginationCourse;
      })
      .addCase(fetchCourseFAQs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default faqSlice.reducer;

