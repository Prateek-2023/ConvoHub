import mongoose from "mongoose";

// server/lib/db.js
export const connectDB = async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('Database connected'))
        mongoose.connection.on('error',(err)=>console.error('Mongo error:', err.message))

        const uri = process.env.MONGODB_URI;
        if(!uri) throw new Error('MONGODB_URI not set');

        await mongoose.connect(uri, { 
            serverSelectionTimeoutMS: 30000, // Increased timeout
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });
    }catch(error){
        console.log('Mongo connection failed:', error.message)
        process.exit(1);
    }
}