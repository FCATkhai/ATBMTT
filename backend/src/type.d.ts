// import { Request } from 'express';
import { IUser } from './config/interface'
export {}
declare global {
    namespace Express {
        interface Request {
            user?: IUser
            access_token?: string
        }
    }

    interface IError {
        status?: number
        message?: string
    }
}
