const mongoose = require("mongoose")
const connectDB = async ()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/Seeds_Selling")
        console.log("mongo db connected...");
        
    }catch(err){
        console.log(err,"not connected...");
        process.exit(1)
    }
}

module.exports = connectDB