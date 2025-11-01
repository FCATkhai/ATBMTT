import { Router } from 'express'
import {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    createMultipleCandidates
} from '~/controllers/candidate.controller'
import { authenticate, authorize } from '~/middleware/auth.middleware'
import { USER_GROUPS } from '~/config/constant'

const router = Router()

router.post('/', authorize(USER_GROUPS.ADMINS_ONLY), createCandidate)
router.post('/multiple', authorize(USER_GROUPS.ADMINS_ONLY), createMultipleCandidates)
router.get('/', authenticate, getAllCandidates)
router.get('/:id', authenticate, getCandidateById)
router.put('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateCandidate)
router.patch('/:id', authorize(USER_GROUPS.ADMINS_ONLY), updateCandidate)
router.delete('/:id', authorize(USER_GROUPS.ADMINS_ONLY), deleteCandidate)

export default router
