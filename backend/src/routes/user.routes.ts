import express from 'express'
import { createUser, loginUser, logoutUser } from '~/controllers/user.controller'
import { authenticate } from '~/middleware/auth.middleware'
const router = express.Router()

// Đăng ký tài khoản
router.post('/register', createUser)
router.post('/login', loginUser)
router.post('/logout', authenticate, logoutUser)
export default router
