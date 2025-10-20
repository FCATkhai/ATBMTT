import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// export const dbConfig = {
//     database: "test",
//     imgBucket: "images"
// }

const connectDB = async (): Promise<void> => {
    // try {
    //     mongoose.set("strictQuery", false);
    //     await mongoose.connect(process.env.MONGO_URI as string);
    //     console.log('MongoDB connected');
    // } catch (error) {
    //     console.error('MongoDB connection error:', error);
    //     process.exit(1);
    // }
    try {
        mongoose.set("strictQuery", false);
        const mongoUri = process.env.MONGO_URI as string;
        if (!mongoUri) {
            throw new Error("Missing MONGO_URI environment variable.");
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect()
    }
};

export default connectDB;

