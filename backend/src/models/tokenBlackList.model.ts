import { Schema, model } from 'mongoose'

interface ITokenBlacklist {
    token: string
    expiresAt: Date
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true } // tự động xoá sau khi token hết hạn
})

// TTL index để MongoDB tự xoá document khi hết hạn
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const TokenBlacklist = model('TokenBlacklist', TokenBlacklistSchema)
export default TokenBlacklist
