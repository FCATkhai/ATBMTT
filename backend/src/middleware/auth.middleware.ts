import type { Request, Response, NextFunction } from 'express'
import User from '../models/user.model'
import TokenBlacklist from '../models/tokenBlackList.model'
import jwt from 'jsonwebtoken'
import { USER_ROLES } from '~/config/constant'

import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

// khi nào chỉ cần xác thực thì dùng middleware này
// Middleware kiểm tra token và lấy user
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            if (!token) {
                res.status(401)
                throw new Error('Unauthorized')
            }
            // Kiểm tra token có bị thu hồi không
            const isBlacklisted = await TokenBlacklist.findOne({ token })
            if (isBlacklisted) {
                res.status(401)
                throw new Error('Token has been revoked. Please log in again.')
            }

            const decoded = jwt.verify(token, JWT_SECRET) as { _id: string; role: string }
            const user = await User.findById(decoded._id).select('-password')

            if (!user) {
                res.status(401)
                throw new Error('User not found')
            }
            req.user = user
            req.access_token = token
            next()
        } else {
            res.status(401)
            throw new Error('Missing or invalid Authorization header')
        }
    } catch (error) {
        next(error)
    }
}

// Middleware xác thực + kiểm tra quyền truy cập dựa trên role
// nếu mảng allowRoles là [] nghĩa là tất cả user đã đăng nhập có quyền truy cập
export const authorize =
    (allowedRoles: string[] = []) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1]
                if (!token) {
                    res.status(401)
                    throw new Error('Unauthorized')
                }
                // Kiểm tra token có bị thu hồi không
                const isBlacklisted = await TokenBlacklist.findOne({ token })
                if (isBlacklisted) {
                    res.status(401)
                    throw new Error('Token has been revoked. Please log in again.')
                }

                const decoded = jwt.verify(token, JWT_SECRET) as { _id: string; role: string }
                const user = await User.findById(decoded._id).select('-password')

                if (!user) {
                    res.status(401)
                    throw new Error('User not found')
                }
                req.user = user
                req.access_token = token
                // Kiểm tra quyền hạn (Authorize)
                if (allowedRoles.length != 0 && !allowedRoles.includes(user.role as string)) {
                    res.status(403)
                    throw new Error('Forbidden - You do not have permission')
                }
                next()
            } else {
                res.status(401)
                throw new Error('UnauthoMissing or invalid Authorization headerrized')
            }
        } catch (error) {
            next(error)
        }
    }

// chỉ allow admin hoặc chính chủ (dựa vào id trong query param hoặc params)
export const onwershipAuthorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestUserId = req.query.id || req.params.id
        if (!requestUserId) {
            res.status(400)
            throw new Error('Bad Request: missing user id in query or params')
        }
        if (req.user?.role !== USER_ROLES.ADMIN && req.user?._id !== requestUserId) {
            res.status(403)
            throw new Error('Access denied: insufficient permissions')
        }
    } catch (error) {
        next(error)
    }
}
