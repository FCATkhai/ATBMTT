import { Router } from 'express'
import {
    createElection,
    updateElection,
    getAllElections,
    getElectionById,
    deleteElection
} from '~/controllers/election.controller'
import { authenticate, authorize, onwershipAuthorize } from '~/middleware/auth.middleware'
import { USER_GROUPS } from '~/config/constant'

const router = Router()

router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createElection)
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateElection)
router.get('/', authenticate, getAllElections)
router.get('/:id', authenticate, getElectionById)
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteElection)
export default router
