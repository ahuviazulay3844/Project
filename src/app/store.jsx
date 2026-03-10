import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../features/User/redux/userApi";
import userReducer from "../features/User/redux/userSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});