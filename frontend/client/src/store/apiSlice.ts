import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserLogin, LoginResponse} from '../types/auth';

import type { RootState } from './store';
import { ICandidate, IUser } from '../types/election';
export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:5000/api/",
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
    getCandidateByElectionId: builder.query<ICandidate[], string>({
      query: (id) => 'candidate/electionId/' + id
    }),
    getCandidates: builder.query<ICandidate[], void>({
      query: () => 'candidate/'
    }),
    loginUser: builder.mutation<LoginResponse, UserLogin>({
      query: (loginData) => ({
        url: "users/login",
        method: "POST",
        body: loginData
      })
    }),

  })
})

export default apiSlice;