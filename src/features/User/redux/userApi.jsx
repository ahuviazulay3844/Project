import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: "userApi",
    tagTypes: ['User'], 
    baseQuery: fetchBaseQuery({ 
        baseUrl: "https://localhost:7034/api/",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().user?.token || localStorage.getItem('token');
            if (token) {
                const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                headers.set('authorization', authHeader);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // התחברות
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: "Users/login", 
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        // הרשמה (POST)
        registerUser: builder.mutation({
            query: (newUser) => ({
                url: "Users/register", 
                method: "POST",
                body: newUser,
            }),
        }),

        // שליפת כל המשתמשים (לאדמין)
        getAllUsers: builder.query({
            query: () => "Users",
            providesTags: ['User'],
        }),

        // שליפת משתמש לפי ID
        getUserById: builder.query({
            query: (id) => `Users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        // עדכון פרטי משתמש
        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `Users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // מחיקת משתמש
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `Users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['User'],
        }),

        // שינוי סיסמה
        changePassword: builder.mutation({
            query: ({ userId, oldPassword, newPassword }) => ({
                url: `Users/change-password`,
                method: "PATCH",
                params: { userId, oldPassword, newPassword }
            }),
        }),

        // חסימה/שחרור משתמש
        toggleBlockUser: builder.mutation({
            query: (userId) => ({
                url: `Users/toggle-block/${userId}`,
                method: "PATCH",
            }),
            invalidatesTags: ['User'],
        }),

        // המשתמש הנוכחי
        getCurrentUser: builder.query({
            query: () => "Users/current",
            providesTags: ['User'],
        }),

        // שליחת קוד אימות להרשמה
        sendVerificationCode: builder.mutation({
            query: (email) => ({
                url: `Users/request-registration-code`,
                method: 'POST',
                params: { email },
            }),
        }),

        // אימות קוד הרשמה
        verifyRegistrationCode: builder.mutation({
            query: ({ email, code }) => ({
                url: `Users/verify-registration-code`,
                method: 'POST',
                params: { email, code },
            }),
        }),
    }),
});

export const { 
    useLoginUserMutation, 
    useRegisterUserMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useChangePasswordMutation,
    useToggleBlockUserMutation,
    useGetCurrentUserQuery,
    useSendVerificationCodeMutation,
    useVerifyRegistrationCodeMutation 
} = userApi;