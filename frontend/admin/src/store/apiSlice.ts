import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserSignUp, UserLogin, LoginResponse} from '../types/auth';

import type { RootState } from './store';
import { IUser } from '../types/election';
export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:3000/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
    return headers
  },
  }),

  endpoints: (builder) => ({
    getUsers: builder.query<IUser[], void>({
      query: () => 'users/',
    }),
    createUser: builder.mutation<IUser, Partial<UserSignUp>>({
      query: (newUser) => ({
        url: "users",
        method: "POST",
        body:  newUser
      })
    }),
    loginUser: builder.mutation<LoginResponse, UserLogin>({
      query: (loginData) => ({
        url: "auth/login",
        method: "POST",
        body: loginData
      })
    })
  })
})

export default apiSlice;