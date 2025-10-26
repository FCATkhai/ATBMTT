import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserSignUp, UserLogin, LoginResponse} from '../types/auth';

import type { RootState } from './store';
import { ICandidate, ICandidateCreate, IElection, IElectionCreate, IUser } from '../types/election';
export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:5000/",
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
    }),
    createElection: builder.mutation<IElection, IElectionCreate>({
      query: (electionData) => ({
        url: "election",
        method: "POST",
        body: electionData
      })
    }),
    createCandidate: builder.mutation<ICandidate, ICandidateCreate>({
      query: (candidateData) => ({
        url: "candidate",
        method: "POST",
        body: candidateData
      })      
    }),
    creatListCandidate: builder.mutation<ICandidate[], ICandidateCreate[]>({
      query: (candidateData) => ({
        url: "candidate/list",
        method: "POST",
        body: candidateData
      })           
    })
  })
})

export default apiSlice;