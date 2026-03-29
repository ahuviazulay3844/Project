import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const carApi = createApi({
    reducerPath: 'carApi',
    // בסיס הכתובת לשרת ה-API שלך
    baseQuery: fetchBaseQuery({ baseUrl: 'https://localhost:7034/api/' }), 
    endpoints: (builder) => ({
        // שליפת כל הרכבים ללא מיון מיוחד
        getAllCars: builder.query({
            query: () => "Cars", 
        }),
        
        // שליפת רכבים ממוינים לפי מרחק מהמשתמש
        getClosestCars: builder.query({
            query: ({ lat, lng }) => `Cars/closest?lat=${lat}&lng=${lng}`,
        }),
    }),
});

export const { 
    useGetAllCarsQuery, 
    useGetClosestCarsQuery 
} = carApi;