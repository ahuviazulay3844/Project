import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: "userApi",
    // tagTypes עוזר לנו לרענן נתונים באופן אוטומטי (למשל אחרי התחברות)
    tagTypes: ['User'], 
    baseQuery: fetchBaseQuery({ 
        baseUrl: "https://localhost:7034/api",
        prepareHeaders: (headers, { getState }) => {
            // 1. ניסיון שליפת טוקן מהסטייט של Redux
            const token = getState().user?.token; 
            
            // 2. גיבוי: אם אין בסטייט (למשל אחרי רענון דף), ננסה מה-LocalStorage
            const backupToken = localStorage.getItem('token');
            
            const finalToken = token || backupToken;

            if (finalToken) {
                // חשוב: לוודא שאין כפילות של המילה Bearer
                const authHeader = finalToken.startsWith('Bearer ') 
                    ? finalToken 
                    : `Bearer ${finalToken}`;
                headers.set('authorization', authHeader);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // התחברות - מחזירה string (הטוקן)
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: "Users/login", 
                method: "POST",
                body: credentials,
            }),
            // מציין שכל מי שצורך את נתוני המשתמש צריך להתרענן
            invalidatesTags: ['User'],
        }),

        // הרשמה (הוספת משתמש חדש)
        registerUser: builder.mutation({
            query: (newUser) => ({
                url: "Users/add", // שימי לב: ב-Controller שלך זה בדרך כלל "add" או POST על הבסיס
                method: "POST",
                body: newUser,
            }),
        }),

        // שליחת קוד אימות למייל
        sendVerificationCode: builder.mutation({
            query: (email) => ({
                url: `Users/request-registration-code`,
                method: 'POST',
                params: { email: email.trim().toLowerCase() }, // שימוש ב-params במקום שרשור ידני ב-URL
            }),
        }),

        // בדיקת קוד האימות
        verifyRegistrationCode: builder.mutation({
            query: ({ email, code }) => ({
                url: `Users/verify-registration-code`,
                method: 'POST',
                params: { 
                    email: email.trim().toLowerCase(), 
                    code: code.trim() 
                },
            }),
        }),

        // שליפת המשתמש המחובר כרגע
        getCurrentUser: builder.query({
            query: () => "Users/current",
            providesTags: ['User'], // קושר את השאילתה לתג 'User'
        }),
    }),
});

export const { 
    useLoginUserMutation, 
    useRegisterUserMutation,
    useSendVerificationCodeMutation,
    useVerifyRegistrationCodeMutation,
    useGetCurrentUserQuery 
} = userApi;