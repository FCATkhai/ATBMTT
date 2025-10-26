import { Schema, model } from 'mongoose'
import type { IElection } from '~/@types/dbInterfaces'

const electionSchema = new Schema<IElection>(
    {
        name: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        candidateIds: [{ type: String, required: true }],
        status: {
            type: String,
            enum: ['upcoming', 'running', 'finished'],
            default: 'upcoming'
        },
        publicKey: {
            n: { type: String, required: true },
            g: { type: String, required: true }
        }
    },
    { timestamps: true }
)

const ElectionModel = model<IElection>('Election', electionSchema)
export default ElectionModel
