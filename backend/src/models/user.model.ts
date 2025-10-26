import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import type { IUser } from '~/@types/dbInterfaces'

const UserSchema = new Schema<IUser>(
    {
        /* Collection người dùng: Dùng chung cho các người dùng trong hệ thống */
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            require: true,
            enum: ['voter', 'admin'],
            default: 'voter'
        } /* vai trò của người dùng */,
        hasVoted: { type: Boolean },
        electionId: { type: Schema.Types.ObjectId, ref: 'Election' }
    },
    { timestamps: true }
)

/** Hash password before saving */
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

/** Compare password */
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password)
}

const UserModel = model<IUser>('User', UserSchema)
export default UserModel
