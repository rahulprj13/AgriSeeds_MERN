const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    UserName:{
        type:String
    },
    UserAge:{
        type:Number
    },
    Gender:{
        type:String,
        enum:["Male", "Female"]
    }
})
module.exports = mongoose.model("Users",UserSchema)