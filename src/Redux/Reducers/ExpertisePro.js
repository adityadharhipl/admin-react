import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  expertiseData: [], 
  status: 'idle', 
  error: null,    
};

export const fetchExpertise = createAsyncThunk('expertise/fetchExpertise', async () => {
  const token = localStorage.getItem("User-admin-token");

  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/expertise`, {
    method: 'GET',
    headers: {
      'Authorization': token, 
      'Content-Type': 'application/json',
    },
  });



  if (!response.ok) {
    throw new Error('Failed to fetch expertise data');
  }

  const data = await response.json();

  return data;  
});

export const postExpertise = createAsyncThunk('expertise/postExpertise', async (expertiseData) => {
  const token = localStorage.getItem("User-admin-token");

  if (!token) {
    throw new Error('Authorization token not found');
  }

  const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/expertise`, {
    method: 'POST',
    headers: {
      'Authorization': token, 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expertiseData),  
  });

 

  if (!response.ok) {
    throw new Error('Failed to post expertise data');
  }

  const data = await response.json();
  return data;
});

const expertiseSlice = createSlice({
  name: 'expertise',  
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpertise.pending, (state) => {
        state.status = 'loading';  
      })
      .addCase(fetchExpertise.fulfilled, (state, action) => {
        state.status = 'succeeded';  
        state.expertiseData = action.payload;  
      })
      .addCase(fetchExpertise.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.error.message;  
      });

    builder
      .addCase(postExpertise.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(postExpertise.fulfilled, (state, action) => {
        state.status = 'succeeded';  
        state.expertiseData.push(action.payload);  
      })
      .addCase(postExpertise.rejected, (state, action) => {
        state.status = 'failed';  
        state.error = action.error.message;  
      });
  },
});

export default expertiseSlice.reducer;
