import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const carApi=createApi({
    reducerPath:'carApi',
    baseQuery:fetchBaseQuery({baseUrl:'https://localhost:7034/api/'}),
    endpoints:(builder)=>({
       getAllCars: builder.query({
    query: () => "Cars", 
}),
})});
export const {useGetAllCarsQuery}=carApi;