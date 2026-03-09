import { createSlice } from '@reduxjs/toolkit';
import { userApi } from './userApi';

const initialState = {
  currentUser: null,
  token: null, // נוסיף שדה נפרד לטוקן
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
extraReducers: (builder) => {
  builder.addMatcher(
    userApi.endpoints.loginUser.matchFulfilled,
    (state, { payload }) => {
      // payload עכשיו מכיל את האובייקט החדש מהשרת
      state.token = payload.token; 
      state.currentUser = payload.user; // כאן נשמר השם "אהובה"
      
      localStorage.setItem('token', payload.token);
    }
  );
},
});

export default userSlice.reducer;
export const { logout } = userSlice.actions;