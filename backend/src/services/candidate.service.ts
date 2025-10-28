import type { ICandidate, IElection } from '~/@types/dbInterfaces'
import Candidate from '~/models/candidate.model'
import Election from '~/models/election.model'
import { Model } from 'mongoose'
import AppError from '~/utils/appError'

class CandidateService {
    private candidateModel: Model<ICandidate>
    private electionModel: Model<IElection>

    constructor() {
        this.candidateModel = Candidate
        this.electionModel = Election
    }
    async createCandidate(candidateData: Partial<ICandidate>): Promise<ICandidate> {
        try {
            const election = await this.electionModel.findById(candidateData.electionId)
            if (!election) {
                throw new AppError(404, 'Election not found')
            }
            const newCandidate = await this.candidateModel.create(candidateData)

            return newCandidate
        } catch (error) {
            throw Error(`Error creating candidate: ' ${(error as Error).message}`)
        }
    }
}
export default new CandidateService()
