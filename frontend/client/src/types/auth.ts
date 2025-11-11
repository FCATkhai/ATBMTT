import { IUser } from "./election"

export interface Response {
    success: boolean
    message:string
}

export interface UserLogin {
    email: string,
    password: string
}

export interface LoginResponse extends Response {
    access_token: string,
    user: IUser
}
export interface LogoutResponse extends Response {

}
export interface UsersResponse {
    message: string,
    data: IUser[]
}
export interface ApiResponse<T> {
    message: string,
    data: T
}