import { IUser } from "./election"

export interface Response {
    success: boolean
    message:string
}

export interface UserLogin {
    email: string,
    password: string
}

export interface UserSignUp {
    email: string,
    password: string,
    name: string,
    role: string
}
export interface SignUpResponse extends Response {
    user: IUser
}
export interface LoginResponse extends Response {
    accessToken: string,
    user: IUser
}
export interface LogoutResponse extends Response {

}