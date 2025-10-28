import type { Request, Response, NextFunction } from 'express'
import User from '~/models/user.model'
import TokenBlacklist from '~/models/tokenBlackList.model'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { USER_ROLES } from '~/config/constant'
import userService from '~/services/user.service'

const JWT_SECRET = process.env.JWT_SECRET as string
//TODO: thêm chức năng chuyển role user, refactor response dùng data thay vì user, candidate, election,...
/**
 *  Đăng ký tài khoản
 *  @route POST /api/users/register
 *  @access Public
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, role, electionId } = req.body

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.status(400)
            throw new Error('Email already exists')
        }

        // Tạo user mới
        const newUser = new User({
            name,
            email,
            password,
            electionId,
            role: role || 'voter' // Mặc định là "voter"
        })

        await newUser.save()

        res.status(201).json({ success: true, message: 'User created successfully', data: newUser })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  Đăng nhập
 *  @route POST /api/users/login
 *  @access Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body

        // Kiểm tra user có tồn tại không
        const user = await User.findOne({ email })
        if (!user) {
            res.status(401)
            throw new Error('Invalid email or password')
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            res.status(401)
            throw new Error('Invalid email or password')
        }
        // Tạo JWT token
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET as jwt.Secret,
            { expiresIn: process.env.JWT_EXPIRES_IN } as jwt.SignOptions
        )

        res.json({
            success: true,
            message: 'Login successful',
            accessToken: token,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasVoted: user.hasVoted,
                electionId: user.electionId
            }
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Đăng xuất user (thu hồi JWT hiện tại)
 *  @route   POST /api/users/logout
 *  @access  All users
 */
export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.access_token as string

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
        const exp = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 3600 * 1000)

        await TokenBlacklist.create({ token, expiresAt: exp })

        res.json({
            success: true,
            message: 'Logout successful — token has been blacklisted'
        })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy danh sách tất cả người dùng (chỉ Admin)
 *  @route   GET /api/users
 *  @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find().select('-password')
        res.json({ success: true, data: users })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Lấy thông tin người dùng theo Id
 *  @route   GET /api/users/:id
 *  @access  Private
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.query.id).select('-password')
        if (!user) {
            res.status(404)
            throw new Error('User not found')
        }
        res.json({ success: true, data: user })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Cập nhật thông tin người dùng (Admin hoặc chính chủ)
 *  @route   PUT/PATCH /api/users/:id
 *  @access  Private/Admin or Owner
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, role, hasVoted } = req.body

        const updatedUser = await userService.udateUserById(req.query.id as string, { name, role, hasVoted })
        res.json({ success: true, message: 'User updated', data: updatedUser })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  @desc    Xóa người dùng (chỉ Admin)
 *  @route   DELETE /api/users/:id
 *  @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404)
            throw new Error('User not found')
        }

        await user.deleteOne()
        res.json({ success: true, message: 'User deleted successfully' })
    } catch (error: unknown) {
        next(error)
    }
}
