import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const userApi = createApi({
    reducerPath: "userApi",
baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:7034/api" }),
    endpoints: (builder) => ({
        // פונקציית התחברות
        loginUser: builder.mutation({
            query: (user) => ({
                // השלמה לכתובת המלאה שראינו ב-Swagger
                url: "/Users/login", 
                method: "POST",
                body: user,
            }),
        }),
        // פונקציית הרשמה
        registerUser: builder.mutation({
            query: (newUser) => ({
                url: "/Users/register",
                method: "POST",
                body: newUser,
            }),
        }),
    }),
});
export const { useLoginUserMutation, useRegisterUserMutation } = userApi;
