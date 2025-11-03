import { Schema, model } from 'mongoose'
import { type IElection, ELECTION_STATUSES } from '~/@types/dbInterfaces'

const electionSchema = new Schema<IElection>(
    {
        name: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        publicKey: {
            n: { type: String, required: true },
            g: { type: String, required: true },
            n2: { type: String, required: true }
        }
    },
    { timestamps: true }
)

// Virtual status field
electionSchema.virtual('status').get(function (this: any) {
    const now = new Date()
    if (now < this.startTime) return 'upcoming'
    if (now >= this.startTime && now <= this.endTime) return 'ongoing'
    return 'finished'
})

// status xuất hiện khi dùng toJSON/toObject:
electionSchema.set('toJSON', { virtuals: true })
electionSchema.set('toObject', { virtuals: true })

const ElectionModel = model<IElection>('Election', electionSchema)
export default ElectionModel
