import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const carApi = createApi({
    reducerPath: 'carApi',
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
    tagTypes: ['Cars'],
    endpoints: (builder) => ({
        
        // --- Queries (שליפת נתונים) ---

    getAllCars: builder.query({
    query: () => "Cars",
    providesTags: (result) =>
        result
            ? [...result.map(({ id }) => ({ type: 'Cars', id })), { type: 'Cars', id: 'LIST' }]
            : [{ type: 'Cars', id: 'LIST' }],

}),


        getCarById: builder.query({
            query: (id) => `Cars/${id}`,
            providesTags: (result, error, id) => [{ type: 'Cars', id }],
        }),
getClosestCars: builder.query({
    query: ({ lat, lng, start, end }) => {

        let url = `Cars/closest?lat=${lat}&lng=${lng}`;

        if (start) url += `&start=${encodeURIComponent(start)}`;
        if (end) url += `&end=${encodeURIComponent(end)}`;

        return url;
    },
    providesTags: ['Cars'],
}),


        getAvailableCars: builder.query({
            query: ({ start, end, regionId }) => 
                `Cars/available?start=${start}&end=${end}&regionId=${regionId}`,
            providesTags: ['Cars'],
        }),

        checkCarSuitability: builder.query({
            query: ({ id, start, end }) => `Cars/${id}/check-suitability?start=${start}&end=${end}`,
        }),

        getPopularCars: builder.query({
            query: (count = 5) => `Cars/popular?count=${count}`,
        }),

        getVehiclesNeedingFuel: builder.query({
            query: () => "Cars/needs-fuel",
            providesTags: ['Cars'],
        }),

        isCarFit: builder.query({
            query: (id) => `Cars/${id}/is-fit`,
        }),

        getCarsByStatus: builder.query({
            query: (status) => `Cars/status/${status}`,
            providesTags: ['Cars'],
        }),

        getAvailableCarsByRegion: builder.query({
            query: (regionId) => `Cars/available/by-region/${regionId}`,
            providesTags: ['Cars'],
        }),

        getCarExtendedStatus: builder.query({
            query: (id) => `Cars/${id}/extended-status`,
            providesTags: (result, error, id) => [{ type: 'Cars', id }],
        }),

        // --- Mutations (עדכונים ופעולות) ---

        addCar: builder.mutation({
            query: (newCar) => ({
                url: 'Cars',
                method: 'POST',
                body: newCar,
            }),
            invalidatesTags: ['Cars'],
        }),

        updateCar: builder.mutation({
            query: ({ id, car }) => ({
                url: `Cars/${id}`,
                method: 'PUT',
                body: car,
            }),
            invalidatesTags: ['Cars'],
        }),

        deleteCar: builder.mutation({
            query: (id) => ({
                url: `Cars/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cars'],
        }),

        updateFuelLevel: builder.mutation({
            query: ({ id, newLevel }) => ({
                url: `Cars/${id}/fuel`,
                method: 'PATCH',
                body: newLevel,
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Cars'],
        }),

        updateMileage: builder.mutation({
            query: ({ id, newMileage }) => ({
                url: `Cars/${id}/mileage`,
                method: 'PATCH',
                body: newMileage,
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Cars'],
        }),

        updateCarStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `Cars/${id}/status`,
                method: 'PATCH',
                body: JSON.stringify(status),
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Cars'],
        }),

        sendToMaintenance: builder.mutation({
            query: (carId) => ({
                url: `Cars/${carId}/send-to-maintenance`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Cars'],
        }),

        releaseFromMaintenance: builder.mutation({
            query: (carId) => ({
                url: `Cars/${carId}/release-from-maintenance`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Cars'],
        }),
// updateCarLock: builder.mutation({
//   query: ({ id, isLocked }) => ({
//     url: `Cars/${id}/toggle-lock`,
//     method: 'PATCH',
//     // כאן אנחנו שולחים אובייקט JSON תקין
//     body: { isLocked: isLocked }, 
//     headers: { 'Content-Type': 'application/json' },
//   }),
//   invalidatesTags: ['Cars'],
// }),
updateCarLock: builder.mutation({
  query: ({ id, isLocked }) => ({
    url: `Cars/${id}/toggle-lock`,
    method: 'PATCH',
    body: { isLocked }, 
    headers: { 'Content-Type': 'application/json' },
  }),
  // זה יגרום לכל מי שצופה ברכב הזה (כמו דף פרטי רכב) להתרענן
  invalidatesTags: (result, error, { id }) => [{ type: 'Cars', id }, { type: 'Cars', id: 'LIST' }],
}),
// בתוך endpoints -> builder
extendOrder: builder.mutation({
    query: (orderId) => ({
        url: `Orders/extend/${orderId}`, // הנתיב שיצרנו ב-Controller
        method: 'POST',
    }),
    // זה יגרום לכל המערכת להתרענן ולראות את זמן הסיום החדש
    invalidatesTags: ['Cars'], 
}),
    }),
});
export const { 
    useGetAllCarsQuery,                // שליפת כל הרכבים במערכת
    useGetCarByIdQuery,                // שליפת רכב לפי ID
    useGetClosestCarsQuery,            // רכבים קרובים (lat, lng)
    useGetAvailableCarsQuery,          // פנויים לפי תאריך ואזור
    useCheckCarSuitabilityQuery,       // בדיקת התאמה (דלק/זמינות)
    useGetPopularCarsQuery,            // רכבים פופולריים ביותר
    useGetVehiclesNeedingFuelQuery,    // רכבים עם דלק נמוך
    useIsCarFitQuery,                  // בדיקת תקינות וכשירות
    useGetCarsByStatusQuery,           // סינון לפי סטטוס
    useGetAvailableCarsByRegionQuery,   // פנויים באזור כרגע
    useGetCarExtendedStatusQuery,      // סטטוס זמינות מפורט
    useAddCarMutation,                 // הוספת רכב חדש
    useUpdateCarMutation,              // עדכון פרטי רכב
    useDeleteCarMutation,              // מחיקת רכב מהמערכת
    useUpdateFuelLevelMutation,        // עדכון רמת דלק בלבד
    useUpdateMileageMutation,          // עדכון קילומטראז'
    useUpdateCarStatusMutation,        // שינוי סטטוס רכב ידני
    useSendToMaintenanceMutation,      // שליחה לטיפול/תחזוקה
    useReleaseFromMaintenanceMutation , // החזרה מתחזוקה לפעיל
    useUpdateCarLockMutation, 
    useExtendOrderMutation,         // שינוי סטטוס נעילה של רכב  
} = carApi;