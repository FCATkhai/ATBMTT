import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async (): Promise<void> => {
    try {
        mongoose.set('strictQuery', false)
        const mongoUri = process.env.MONGO_URI as string
        if (!mongoUri) {
            throw new Error('Missing MONGO_URI environment variable.')
        }
        await mongoose.connect(mongoUri)
        console.log('MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

export default connectDB
