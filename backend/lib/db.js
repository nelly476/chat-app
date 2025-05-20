import mongoose from "mongoose"
import dotenv from "dotenv"

export const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected: ${con.connection.host}`)

    } catch(err) {
        console.log("MongoDB connection error:", err)
    }
}