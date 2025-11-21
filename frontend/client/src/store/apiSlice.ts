import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserLogin, LoginResponse, ApiResponse} from '../types/auth';

import type { RootState } from './store';
import { IBallot, IBallotRequest, ICandidate, ICandidateResponse, IElection, IElectionResponse, IResult, IUser } from '../types/election';
export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token

      if (token) {
        headers.set('Authorization', `Bearer ${token.replace(/"/g, '')}`)
      }
      headers.set('Content-Type', 'application/json')
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
    getCandidates: builder.query<ICandidate[], void>({
      query: () => 'candidate/'
    }),
    getElectionsByUserId: builder.query<IElectionResponse, string>({
      query: (id) => 'elections/user/'+id
    }),
    getElectionById: builder.query<ApiResponse<IElection>, string>({
      query: (electionId) => 'elections/'+electionId
    }),
    loginUser: builder.mutation<LoginResponse, UserLogin>({
      query: (loginData) => ({
        url: "users/login",
        method: "POST",
        body: loginData
      })
    }),
    voteCandidate: builder.mutation<ApiResponse<IBallot>, IBallotRequest>({
      query: (ballotData) => ({
        url: "ballots/",
        method: "POST",
        body: ballotData
      })      
    }),
    getElectionResults: builder.query<ApiResponse<IResult>, string>({
      query: (electionId) => `results/${electionId}`,
      // providesTags: ['Result']
    }),

  })
})

export default apiSlice;