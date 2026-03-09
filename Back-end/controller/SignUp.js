const User = require("../models/UserModel.js")
const bcrypt = require("bcryptjs")

// REGISTER
exports.registerUser = async (req,res)=>{

  try{

    const {firstname,lastname,email,password} = req.body

    const userExists = await User.findOne({email})

    if(userExists){
      return res.status(400).json({
        message:"User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await User.create({
      firstname,
      lastname,
      email,
      password:hashedPassword
    })

    res.status(201).json({
      message:"User registered successfully",
      user:{
        id:user._id,
        firstname:user.firstname,
        lastname:user.lastname,
        email:user.email
      }
    })

  }
  catch(err){
    res.status(500).json({message:"Server error"})
  }

}