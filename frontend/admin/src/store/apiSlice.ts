import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserSignUp, UserLogin, LoginResponse, LogoutResponse, UsersResponse, ApiResponse} from '../types/auth';

import type { RootState } from './store';
import { DeleteCandidateRequest, DeleteElectionRequest, ICandidate, ICandidateCreate, ICandidateResponse, IElection, IElectionCreate, IElectionResponse, IResult, IUser, IUSerResponse, UpdateUserRequest } from '../types/election';





export const apiSlice = createApi({
  reducerPath: '/',
  baseQuery: fetchBaseQuery({ 
    baseUrl:"http://localhost:5000/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        console.log(token.replace(/"/g, ''))
        headers.set('Authorization', `Bearer ${token.replace(/"/g, '')}`)
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
    getUsersByElectionId: builder.query<UsersResponse, string>({
      query: (id) => `users?electionId=${id}`
    }),    
    getCandidates: builder.query<ICandidate[], void>({
      query: () => 'candidates/'
    }),
    getElections: builder.query<IElectionResponse, void>({
      query: () => 'elections/'
    }),
    updateElection: builder.mutation<IElection, { electionId: string; data: Partial<IElectionCreate> }>({
      query: ({ electionId, data }) => ({
        url: `elections/${electionId}`,
        method: "PATCH",
        body: data,
      }),
    }),
    createUser: builder.mutation<IUSerResponse, Partial<UserSignUp>>({
      query: (newUser) => ({
        url: "users/register",
        method: "POST",
        body:  newUser
      })
    }),
    updateUser: builder.mutation<IUSerResponse, UpdateUserRequest>({
      query: (patchData) => ({
        url: "/users/"+ patchData.userId,
        method: "PATCH",
        body: patchData
      })
    }),
    deleteUser: builder.mutation<IUser, UpdateUserRequest>({
      query: (patchData) => ({
        url: "/users/"+ patchData.userId,
        method: "DELETE",
        body: patchData
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
        url: "candidates/"+candidate.candidateId,
        method: "DELETE",
        body: candidate
      })
    }),
    deleteElection: builder.mutation<boolean, DeleteElectionRequest>({
      query: (election) => ({
        url: "elections/"+election.electionId,
        method: "DELETE",
        body: election
      })
    }),
    // 1. Trigger việc kiểm phiếu (Server thực hiện cộng đồng cấu)
    countElection: builder.mutation<ApiResponse<IResult>, string>({
      query: (electionId) => ({
        url: `results/count/${electionId}`,
        method: 'POST',
      }),
    }),

    // 2. Gửi kết quả đã giải mã lên server
    updateDecryptedResults: builder.mutation<
      ApiResponse<IResult>, 
      { electionId: string; tallies: { candidateId: string; decryptedSum: number }[] }
    >({
      query: ({ electionId, tallies }) => ({
        url: `results/decrypt/${electionId}`,
        method: 'PUT',
        body: { tallies },
      }),
    }),

    getElectionResults: builder.query<ApiResponse<IResult>, string>({
      query: (electionId) => `results/${electionId}`,
      // providesTags: ['Result']
    }),
  })
})

export default apiSlice;