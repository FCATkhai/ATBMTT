import type { IUser } from '~/@types/dbInterfaces'
import User from '~/models/user.model'
import { Model } from 'mongoose'
import AppError from '~/utils/AppError'

class UserService {
    private userModel: Model<IUser>

    constructor() {
        this.userModel = User
    }

    async updateUserById(userId: string, updateData: Partial<IUser>): Promise<IUser> {
        try {
            const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true })
            if (!user) {
                throw new AppError(404, 'User not found')
            }
            return user
        } catch (error) {
            throw Error(`Error updating user: ${(error as Error).message}`)
        }
    }

    async getUserById(userId: string): Promise<IUser | null> {
        try {
            const user = await this.userModel.findById(userId).select('-password')
            return user
        } catch (error) {
            throw Error(`Error retrieving user: ${(error as Error).message}`)
        }
    }
}

export default new UserService()
