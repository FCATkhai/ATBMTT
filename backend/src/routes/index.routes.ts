import { Router } from 'express'
import userRoutes from './user.routes'
import electionRoutes from './election.routes'
import candidateRoutes from './candidate.routes'
import ballotRoutes from './ballot.routes'
import resultRoutes from './result.routes'

const router = Router()

router.use('/users', userRoutes)
router.use('/elections', electionRoutes)
router.use('/candidates', candidateRoutes)
router.use('/ballots', ballotRoutes)
router.use('/results', resultRoutes)

export default router
