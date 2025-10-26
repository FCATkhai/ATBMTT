import { Schema, model } from 'mongoose'
import type { IBallot } from '~/@types/dbInterfaces'

const BallotSchema = new Schema<IBallot>(
    {
        /* Collection phiếu bầu */
        voteToken: { type: String, required: true, unique: true },
        electionId: { type: Schema.Types.ObjectId, required: true },
        encryptedBallot: { type: String, required: true }, // ciphertext
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
)

const BallotModel = model<IBallot>('Candidate', BallotSchema)
export default BallotModel
