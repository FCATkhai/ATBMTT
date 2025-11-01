import { Router } from 'express'
import {
    createUser,
    loginUser,
    logoutUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '~/controllers/user.controller'
import { authenticate, authorize, onwershipAuthorize } from '~/middleware/auth.middleware'
import { USER_GROUPS } from '~/config/constant'

const router = Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.post('/logout', authenticate, logoutUser)

router.get('/', authorize(USER_GROUPS.ADMINS_ONLY), getAllUsers)
router.get('/:id', authenticate, onwershipAuthorize, getUserById)
router.put('/:id', authenticate, onwershipAuthorize, updateUser)
router.patch('/:id', authenticate, onwershipAuthorize, updateUser)
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteUser)
export default router
