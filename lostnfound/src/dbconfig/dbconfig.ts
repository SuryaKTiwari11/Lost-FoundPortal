import mongoose from 'mongoose';
import dotenv from 'dotenv';
//data base kaha hai 
//dusre continent mei hai 
//we must use async await + try and catch


export async function connectDB() {
    try{
        mongoose.connect(process.env.MONGODB_URI!)
        const connection = mongoose.connection

        connection.on

    }
    catch(err) {
        console.log("Error connecting to database: ", err);
    }
}
