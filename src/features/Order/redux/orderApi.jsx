import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'https://localhost:7034/api/',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token'); 
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        
        // --- Queries (שליפת נתונים) ---
        
        getAllOrders: builder.query({
            query: () => "Orders",
            providesTags: ['Orders'],
        }),

        getOrderById: builder.query({
            query: (id) => `Orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Orders', id }],
        }),

        getActiveOrder: builder.query({
            query: () => "Orders/active",
            providesTags: ['Orders'],
        }),

        getOrdersCount: builder.query({
            query: () => "Orders/count",
        }),

        getTotalRevenue: builder.query({
            query: ({ start, end }) => `Orders/revenue?start=${start}&end=${end}`,
        }),

        // --- Mutations (פעולות ועדכונים) ---

        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: 'Orders',
                method: 'POST',
                body: newOrder,
            }),
            invalidatesTags: ['Orders'],
        }),

        cancelOrder: builder.mutation({
            query: (orderId) => ({
                url: `Orders/cancel/${orderId}`,
                method: 'HttpPatch', // שימי לב שב-C# רשמת HttpPatch לביטול
            }),
            invalidatesTags: ['Orders'],
        }),

        reportStartCondition: builder.mutation({
            query: ({ id, isDirty, isDamaged, comments }) => ({
                url: `Orders/${id}/submit-start-report?isDirty=${isDirty}&isDamaged=${isDamaged}&comments=${comments}`,
                method: 'POST',
            }),
            invalidatesTags: ['Orders'],
        }),

        unlockCar: builder.mutation({
            query: (id) => ({
                url: `Orders/${id}/unlock`,
                method: 'POST',
            }),
        }),

        lockCar: builder.mutation({
            query: (id) => ({
                url: `Orders/${id}/lock`,
                method: 'PUT',
            }),
        }),

        finishOrder: builder.mutation({
            query: ({ id, mileage, fuelTime }) => ({
                url: `Orders/${id}/finish?mileage=${mileage}&fuelTime=${fuelTime}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders'],
        }),

        markAsPaid: builder.mutation({
            query: (orderId) => ({
                url: `Orders/mark-as-paid/${orderId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders'],
        }),
    }),
});

export const { 
    useGetAllOrdersQuery,           // שליפת כל ההזמנות (אדמין)
    useGetOrderByIdQuery,           // פרטי הזמנה ספציפית
    useGetActiveOrderQuery,         // מציאת ההזמנה הנוכחית של המשתמש
    useGetOrdersCountQuery,         // כמות הזמנות כוללת (אדמין)
    useGetTotalRevenueQuery,        // סך הכנסות (אדמין)
    useCreateOrderMutation,         // ביצוע הזמנה חדשה
    useCancelOrderMutation,         // ביטול הזמנה
    useReportStartConditionMutation, // דיווח מצב רכב ותחילת נסיעה
    useUnlockCarMutation,           // פתיחת נעילת הרכב
    useLockCarMutation,             // נעילת הרכב
    useFinishOrderMutation,         // סיום הנסיעה וסגירת הזמנה
    useMarkAsPaidMutation           // סימון הזמנה כנפרעת
} = orderApi;