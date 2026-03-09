const User = require("../models/UserModel.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// REGISTER
exports.registerUser = async (req,res)=>{

  try{

    const {name,email,password} = req.body

    const userExists = await User.findOne({email})

    if(userExists){
      return res.status(400).json({message:"User already exists"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const user = new User({
      name,
      email,
      password:hashedPassword
    })

    await user.save()

    res.status(201).json({
      message:"User registered successfully"
    })

  }
  catch(err){
    res.status(500).json({message:"Server error"})
  }

}