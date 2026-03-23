import { createSlice } from '@reduxjs/toolkit';
import { userApi } from './userApi';

const initialState = {
  token: localStorage.getItem('token') || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem('token');
      // גורם לכל ה-API להימחק מהזיכרון כדי למנוע דליפת נתונים של משתמש קודם
      window.location.reload(); 
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.loginUser.matchFulfilled,
      (state, { payload }) => {
        // payload הוא ה-string שה-API מחזיר (הטוקן)
        state.token = payload; 
        localStorage.setItem('token', payload);
      }
    );
  },
});

export default userSlice.reducer;
export const { logout } = userSlice.actions;