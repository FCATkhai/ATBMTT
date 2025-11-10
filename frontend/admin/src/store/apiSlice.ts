import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserSignUp, UserLogin, LoginResponse, LogoutResponse} from '../types/auth';

import type { RootState } from './store';
import { DeleteCandidateRequest, ICandidate, ICandidateCreate, ICandidateResponse, IElection, IElectionCreate, IElectionResponse, IUser } from '../types/election';





export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        console.log(token)
        headers.set('Authorization', `Bearer ${token.replace(/^"(.*)"$/, '$1')}`)
      }
    return headers
  },
  }),

  endpoints: (builder) => ({
    getUsers: builder.query<IUser[], void>({
      query: () => 'users/',
    }),
    getCandidateByElectionId: builder.query<ICandidateResponse, string>({
      query: (id) => `candidates?electionId=${id}`
    }),
    getUsersByElectionId: builder.query<IUser[], string>({
      query: (id) => `users?electionId=${id}`
    }),    
    getCandidates: builder.query<ICandidate[], void>({
      query: () => 'candidates/'
    }),
    getElections: builder.query<IElectionResponse, void>({
      query: () => 'elections/'
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
        url: "users/login",
        method: "POST",
        body: loginData
      })
    }),
    logoutUser: builder.mutation<LogoutResponse,void>({
      query: () => ({
        url: "users/logout",
        method: "POST"
      })
    }),
    createElection: builder.mutation<IElection, IElectionCreate>({
      query: (electionData) => ({
        url: "elections",
        method: "POST",
        body: electionData
      })
    }),
    createCandidate: builder.mutation<ICandidate, ICandidateCreate>({
      query: (candidateData) => ({
        url: "candidates",
        method: "POST",
        body: candidateData
      })      
    }),
    createListCandidate: builder.mutation<ICandidate[], ICandidateCreate[]>({
      query: (candidateData) => ({
        url: "candidates/multiple",
        method: "POST",
        body: candidateData
      })           
    }),
    deleteCandidate: builder.mutation<boolean, DeleteCandidateRequest>({
      query: (candidate) => ({
        url: "candidate/"+candidate.candidateId,
        method: "DELETE",
        body: candidate
      })
    })
  })
})

export default apiSlice;