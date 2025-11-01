import { IUser } from "./election"

export interface UserLogin {
    email: string,
    password: string,
    role: string
}
export interface UserSignUp {
    email: string,
    password: string,
    name: string
}

export interface LoginResponse extends Response {
    accessToken: string,
    user: IUser
}