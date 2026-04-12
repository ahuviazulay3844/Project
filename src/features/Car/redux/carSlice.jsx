import { createSlice } from "@reduxjs/toolkit";
import { carApi } from "./carApi";

const initialState = {
    carsList: [],
    status: 'idle', // idle | loading | succeeded | failed
    error: null
};

const carSlice = createSlice({
    name: 'car',
    initialState,
    reducers: {
        // כאן אפשר להוסיף פעולות כמו ניקוי הרשימה ביציאה מהמערכת
        resetCarState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // 1. מצב שבו הבקשה התחילה (Loading)
            .addMatcher(
                carApi.endpoints.getAllCars.matchPending, 
                (state) => {
                    state.status = 'loading';
                }
            )
            // 2. מצב שבו הבקשה הצליחה (Succeeded)
            .addMatcher(
                carApi.endpoints.getAllCars.matchFulfilled, 
                (state, { payload }) => {
                    state.status = 'succeeded';
                    state.carsList = payload;
                }
            )
            // 3. מצב שבו הבקשה נכשלה (Failed)
            .addMatcher(
                carApi.endpoints.getAllCars.matchRejected, 
                (state, action) => {
                    state.status = 'failed';
                    state.error = action.error?.message || "חלה שגיאה בטעינת הרכבים";
                }
            );
    },
});
export const selectCarStatus = (state) => state.car.status;
export const selectAllCars = (state) => state.car.carsList;
export const { resetCarState } = carSlice.actions;
export default carSlice.reducer;