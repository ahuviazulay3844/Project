import { createSlice } from "@reduxjs/toolkit";
import { carApi } from "./carApi";
const initialState = {
    carsList: [],
    status: 'idle',// idle | loading | succeeded | failed
};
const carSlice = createSlice({
    name: 'car',// השם של ה-Slice (זה המפתח בתוך ה-Store)
    initialState,
    reducers: {
        //-מחיקה וכו כאן נוכל להוסיף פעולות סינכרוניות אם נרצה
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            carApi.endpoints.getAllCars.matchFulfilled, (state, { payload }) => {
            state.carsList = payload; 
            state.status = 'succeeded';
     }
        );
     
    },});
export default carSlice.reducer;