const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongo db connected...");
        
    }catch(err){
        console.log(err,"not connected...");
        process.exit(1)
    }
}

module.exports = connectDB