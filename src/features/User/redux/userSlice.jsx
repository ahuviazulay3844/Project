import { createSlice } from '@reduxjs/toolkit';
import { userApi } from './userApi';

const initialState = {
  token: localStorage.getItem('token') || null,
  currentUser: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.currentUser = null;
      localStorage.removeItem('token');
      window.location.reload();
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.loginUser.matchFulfilled,
      (state, { payload }) => {
        // אם השרת מחזיר אובייקט עם טוקן ומשתמש
        const token = payload.token || payload; 
        const user = payload.user || null;

        state.token = token;
        localStorage.setItem('token', token);
        
        if (user) {
          state.currentUser = user;
        }
      }
    );
  },
});

export default userSlice.reducer;
export const { logout, setUser } = userSlice.actions;