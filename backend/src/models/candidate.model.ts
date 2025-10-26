import { model, Schema } from 'mongoose'
import type { ICandidate } from '~/@types/dbInterfaces'

const CandidateSchema = new Schema<ICandidate>(
    {
        /* Collection ứng cử viên */
        name: { type: String, required: true },
        image: { type: String },
        electionId: { type: Schema.Types.ObjectId, ref: 'Election' }
    },
    { timestamps: true }
)

const CandidateModel = model<ICandidate>('Candidate', CandidateSchema)
export default CandidateModel
