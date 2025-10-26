import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { IUser } from '../types/election'

interface AuthState {
  user: IUser | null
  token: string | null
}

const initialState: AuthState = {
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  token: localStorage.getItem('token')
    ? JSON.parse(localStorage.getItem('token')!)
    : null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token

      // lưu vào localStorage để giữ đăng nhập
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', JSON.stringify(action.payload.token))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      location.reload()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer