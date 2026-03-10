import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../features/User/redux/userApi";
import userReducer from "../features/User/redux/userSlice";
import { carApi } from "../features/Car/redux/carApi"; 
import carReducer from "../features/Car/redux/carSlice"; 
export const store = configureStore({
  reducer: {
    //  (APIs)
    [userApi.reducerPath]: userApi.reducer,
    [carApi.reducerPath]: carApi.reducer, // הוספת השליח של הרכבים

    //  (Slices)
    user: userReducer,
    car: carReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, carApi.middleware),
});