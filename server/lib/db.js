import mongoose from "mongoose";

//Function to connect to mongo db   
export const connectDB = async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('Database connected'))
        mongoose.connection.on('error',(err)=>console.error('Mongo error:', err.message))

        const uri = process.env.MONGODB_URI;
        if(!uri) throw new Error('MONGODB_URI not set');

        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    }catch(error){
        console.log('Mongo connection failed:', error.message)
        process.exit(1);
    }
}