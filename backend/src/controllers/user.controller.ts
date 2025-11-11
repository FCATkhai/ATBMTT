import type { Request, Response, NextFunction } from 'express'
import User from '~/models/user.model'
import type { IUser } from '~/@types/dbInterfaces'
import TokenBlacklist from '~/models/tokenBlackList.model'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import userService from '~/services/user.service'
import dotenv from 'dotenv'
import transporter from '~/utils/mail'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

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

        // Gửi email chào mừng
        const mailOptions = {
            from: 'npkhai2004@gmail.com',
            to: email,
            subject: 'Chào mừng bạn đến với hệ thống bầu cử',
            html: `<p>Xin chào ${name},</p>
                    <p>Bạn đã được đăng ký tài khoản trong hệ thống bầu cử của chúng tôi.</p>
                    <p>Thông tin đăng nhập của bạn là:</p>
                    <ul>
                        <li>Email: ${email}</li>
                        <li>Mật khẩu: ${password}</li>
                    </ul>
                    <p>Chúng tôi rất vui được hỗ trợ bạn trong quá trình bầu cử.</p>
                    <p>Trân trọng,<br/>Đội ngũ Bầu cử</p>`
        }

        await transporter.sendMail(mailOptions)

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
            data: {
                access_token: token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    hasVoted: user.hasVoted,
                    electionId: user.electionId
                }
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
 *  @route   GET /api/users?electionId=<electionId>
 *  @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { electionId } = req.query

        const filter: Record<string, any> = {}
        if (electionId) {
            filter.electionId = electionId
        }

        const users = await User.find(filter).select('-password')
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
        const { id } = req.params
        const user = await User.findById(id).select('-password')
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
// file: user.controller.ts

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, role, hasVoted, electionId } = req.body

        const updateData: Partial<IUser> = { name, role, hasVoted, electionId }

        // Logic lọc ra các trường undefined
        const filteredUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        ) as Partial<IUser>

        if (Object.keys(filteredUpdateData).length === 0) {
            // Trả về lỗi hoặc user ban đầu nếu không có gì để update
            res.status(400)
            throw new Error('No fields provided for update')
        }

        const updatedUser = await userService.updateUserById(req.params.id as string, filteredUpdateData)

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
