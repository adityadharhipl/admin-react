import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    course: [],
    status: 'idle',
    error: null,
};
export const fetchCourse = createAsyncThunk('course', async (id) => {
    const token = localStorage.getItem("User-admin-token");
    const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/course/${id ?? ''}`, {
        method: id ? 'PATCH' : 'GET', 
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch course data');
    }

    const data = await response.json();
    return data;
});

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourse.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.course = action.payload;
            })
            .addCase(fetchCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default courseSlice.reducer;




// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// const initialState = {
//   course: [],
//   status: 'idle',
//   error: null,
//   pagination: {
//     totalDocs: 0,
//     totalPages: 1,
//     page: 1,
//     limit: 10,
//   },
// };

// // Fetch Courses with Pagination
// export const fetchCourse = createAsyncThunk(
//   'course/fetchCourse',
//   async ({ page, limit  } = {}, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("User-admin-token");
//       const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/course?page=${page}&limit=${limit}`, {
//         headers: {
//           'Authorization': token,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch courses');
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const courseSlice = createSlice({
//   name: 'course',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCourse.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchCourse.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.course = action.payload.data || [];
//         state.pagination = action.payload.paginationDetail || initialState.pagination;
//       })
//       .addCase(fetchCourse.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export default courseSlice.reducer;




// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// const initialState = {
//   course: [],
//   status: 'idle',
//   error: null,
//   pagination: {
//     totalDocs: 0,
//     totalPages: 1,
//     page: 1,
//     limit: 10,
//   },
// };

// // Unified fetchCourse: handles both list and single course fetch
// export const fetchCourse = createAsyncThunk(
//   'course/fetchCourse',
//   async ({ id, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("User-admin-token");

//       let url = '';
//       if (id) {
//         url = `${process.env.REACT_APP_BASEURL}/admin/course/${id}`;
//       } else {
//         url = `${process.env.REACT_APP_BASEURL}/admin/course?page=${page}&limit=${limit}`;
//       }

//       const response = await fetch(url, {
//         headers: {
//           'Authorization': token,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch course data');

//       const data = await response.json();
//       return { data, isSingle: !!id }; 
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const courseSlice = createSlice({
//   name: 'course',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCourse.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchCourse.fulfilled, (state, action) => {
//         state.status = 'succeeded';

//         if (action.payload.isSingle) {
//           state.course = action.payload.data; // for single course
//         } else {
//           state.course = action.payload.data || [];
//           state.pagination = action.payload.data?.paginationDetail || initialState.pagination;
//         }
//       })
//       .addCase(fetchCourse.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export default courseSlice.reducer;
