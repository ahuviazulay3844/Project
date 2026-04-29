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
    refetchOnMountOrArgChange: true,// שורה חדשה: מאלץ רענון נתונים בכל פעם שהפרמטרים משתנים או שהקומפוננטה עולה
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
        
        // פוליש: המרה ל-ISO אם אלו אובייקטים של תאריך
        if (start) params.append('start', start instanceof Date ? start.toISOString() : start);
        if (end) params.append('end', end instanceof Date ? end.toISOString() : end);
        
        return `${url}?${params.toString()}`;
    },
}),
        getOrdersByDate: builder.query({
            query: (date) => `Orders/by-date/${date}`,
            providesTags: ['Orders'],
        }),

getOrdersByDateRange: builder.query({
    query: ({ start, end }) => {
        const s = start instanceof Date ? start.toISOString() : start;
        const e = end instanceof Date ? end.toISOString() : end;
        
        return `Orders/range?start=${s}&end=${e}`;
    },
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
    query: ({ id, report }) => ({
        url: `Orders/${id}/submit-start-report`,
        method: 'POST',
        body: report, // כאן ה-DTO נשלח כ-JSON מלא
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
    query: ({ id, mileage, fuelTime }) => {
        // וידוא שהערכים הם מספרים ושאינם undefined
        const safeMileage = Math.floor(Number(mileage) || 0);
        const safeFuelTime = Math.floor(Number(fuelTime) || 0);
        
        return {
            url: `Orders/${id}/finish?mileage=${safeMileage}&fuelTime=${safeFuelTime}`,
            method: 'PATCH',
        };
    },
    invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }, 'Orders'],
}),

updateProgress: builder.mutation({
    query: (id) => ({
        url: `Orders/${id}/update-progress`,
        method: 'POST',
    }),
    // הוסף שורה זו כדי ש-RTK יבין שצריך לרענן את רשימת ההזמנות
    invalidatesTags: ['Orders'], 
}),

        markAsPaid: builder.mutation({
            query: (orderId) => ({
                url: `Orders/mark-as-paid/${orderId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders'],
        }),

        getClosestCars: builder.query({
          query: ({ lat, lon, start, end }) => {
            let url = `Cars/closest?userLat=${lat}&userLon=${lon}`;
            if (start) url += `&start=${encodeURIComponent(start)}`;
            if (end) url += `&end=${encodeURIComponent(end)}`;
            return url;
          },
          providesTags: ['Cars'],
        }),
 checkUserOverlap: builder.query({
        query: ({ userId, start, end }) => 
            `Orders/check-user-overlap?userId=${userId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
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
    useMarkAsPaidMutation ,
    useLazyCheckUserOverlapQuery
} = orderApi;