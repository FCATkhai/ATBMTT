import { model, Schema } from 'mongoose'
import type { IResult } from '~/@types/dbInterfaces'

const resultSchema = new Schema<IResult>(
    {
        electionId: { type: Schema.Types.ObjectId, required: true },
        tallies: [
            {
                candidateId: { type: Schema.Types.ObjectId, required: true },
                encryptedSum: { type: String, required: true },
                decryptedSum: { type: Number, required: true }
            }
        ]
    },
    { timestamps: true }
)

const ResultModel = model<IResult>('Result', resultSchema)
export default ResultModel
