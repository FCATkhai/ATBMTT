import { Router } from 'express'
import {
    submitBallot,
    getBallotsByElection,
    checkIfVoted,
    deleteBallotsByElection
} from '~/controllers/ballot.controller'
import { authenticate, authorize } from '~/middleware/auth.middleware'
import { USER_GROUPS } from '~/config/constant'

const router = Router()

router.post('/', authenticate, submitBallot) // voter submit
router.post('/check', authenticate, checkIfVoted) // voter check
router.get('/:electionId', authorize(USER_GROUPS.ADMINS_ONLY), getBallotsByElection) // admin view
router.delete('/:electionId', authorize(USER_GROUPS.ADMINS_ONLY), deleteBallotsByElection) // admin reset

export default router
