import { createSlice } from "@reduxjs/toolkit";
import { orderApi } from "./orderApi.jsx";

const initialState = {
    ordersList: [],
    activeOrder: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrderState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(orderApi.endpoints.getAllOrders.matchPending, (state) => {
                state.status = 'loading';
            })
            .addMatcher(orderApi.endpoints.getAllOrders.matchFulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.ordersList = payload;
            })
            .addMatcher(orderApi.endpoints.getAllOrders.matchRejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error?.message || "חלה שגיאה בטעינת ההזמנות";
            })
            // שמירת ההזמנה הפעילה בנפרד 
            .addMatcher(orderApi.endpoints.getActiveOrder.matchFulfilled, (state, { payload }) => {
                state.activeOrder = payload;
            });
    },
});
export const { resetOrderState } = orderSlice.actions;
export const selectAllOrders = (state) => state.order.ordersList;
export const selectActiveOrder = (state) => state.order.activeOrder;
export const selectOrderStatus = (state) => state.order.status;
export default orderSlice.reducer;