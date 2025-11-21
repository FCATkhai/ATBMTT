import { Router } from 'express'
import { countElectionResult, getElectionResult, updateDecryptedResults } from '~/controllers/result.controller'
import { authenticate, authorize } from '~/middleware/auth.middleware'
import { USER_GROUPS } from '~/config/constant'

const router = Router()

router.post('/count/:electionId', authorize(USER_GROUPS.ADMINS_ONLY), countElectionResult) // tổng ciphertext
router.put('/decrypt/:electionId', authorize(USER_GROUPS.ADMINS_ONLY), updateDecryptedResults) // cập nhật decryptedSum
router.get('/:electionId', authenticate, getElectionResult) // lấy ciphertext

export default router
