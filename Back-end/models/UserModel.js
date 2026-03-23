const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

  firstname:{
    type:String,
    required:true
  },

  lastname:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  mobile:{
    type:String,
    required:true,
    unique:true
  },

  role:{
    type:String,
    default:"user",
    enum:["user","admin"]
  },

  status:{
    type:String,
    default:"active",
    enum:["active", "inactive", "deleted", "blocked"]
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpires: {
    type: Date,
    default: null
  }

})

module.exports = mongoose.model("User",UserSchema)