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
    role: string,
    electionId?: string | null
}
export interface SignUpResponse extends Response {
    user: IUser
}
export interface LoginResponse extends Response {
    access_token: string,
    user: IUser
}
export interface LogoutResponse extends Response {

}
