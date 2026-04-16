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
            query: ({ start, end }) => {
                let url = 'Orders/revenue';
                const params = new URLSearchParams();
                if (start) params.append('start', start);
                if (end) params.append('end', end);
                return `${url}?${params.toString()}`;
            },
        }),

        getOrdersByDate: builder.query({
            query: (date) => `Orders/by-date/${date}`,
            providesTags: ['Orders'],
        }),

        getOrdersByDateRange: builder.query({
            query: ({ start, end }) => `Orders/range?start=${start}&end=${end}`,
            providesTags: ['Orders'],
        }),

        getOrdersByUserEmail: builder.query({
            query: (email) => `Orders/by-email/${email}`,
            providesTags: ['Orders'],
        }),

        getOrdersByCarNumber: builder.query({
            query: (carNumber) => `Orders/by-car/${carNumber}`,
            providesTags: ['Orders'],
        }),

        getOrdersByUserId: builder.query({
            query: (userId) => `Orders/user/${userId}`,
            providesTags: ['Orders'],
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

        updateOrder: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `Orders/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: ['Orders'],
        }),

        cancelOrder: builder.mutation({
            query: (orderId) => ({
                url: `Orders/cancel/${orderId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders'],
        }),

        submitStartReport: builder.mutation({
            query: ({ id, isDirty, isDamaged, comments }) => ({
                url: `Orders/${id}/submit-start-report?isDirty=${isDirty}&isDamaged=${isDamaged}&comments=${encodeURIComponent(comments || "")}`,
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

        updateProgress: builder.mutation({
            query: (id) => ({
                url: `Orders/${id}/update-progress`,
                method: 'POST',
            }),
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
    useGetAllOrdersQuery,          
    useGetOrderByIdQuery,
    useGetActiveOrderQuery,
    useGetOrdersCountQuery,
    useGetTotalRevenueQuery,
    useGetOrdersByDateQuery,
    useGetOrdersByDateRangeQuery,
    useGetOrdersByUserEmailQuery,
    useGetOrdersByCarNumberQuery,
    useGetOrdersByUserIdQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useCancelOrderMutation,
    useSubmitStartReportMutation,
    useUnlockCarMutation,
    useLockCarMutation,
    useFinishOrderMutation,
    useUpdateProgressMutation,
    useMarkAsPaidMutation 
} = orderApi;