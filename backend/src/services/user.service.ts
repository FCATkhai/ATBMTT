import type { IUser } from '~/@types/dbInterfaces'
import User from '~/models/user.model'
import { Model } from 'mongoose'
import AppError from '~/utils/appError'

class UserService {
    private userModel: Model<IUser>

    constructor() {
        this.userModel = User
    }

    async udateUserById(userId: string, updateData: Partial<IUser>): Promise<IUser> {
        try {
            const user = await this.userModel.findById(userId)
            if (!user) {
                throw new AppError(404, 'User not found')
            }
            Object.assign(user, updateData)
            await user.save()
            return user
        } catch (error) {
            throw Error(`Error updating user: ' ${(error as Error).message}`)
        }
    }
}

export default new UserService()
