const User = require("../models/UserModel.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// LOGIN
exports.loginUser = async (req,res)=>{

  try{

    const {email,password} = req.body

    const user = await User.findOne({email})

    if(!user){
      return res.status(400).json({message:"Invalid Email"})
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
      return res.status(400).json({message:"Invalid Password"})
    }

    const token = jwt.sign(
      {id:user._id},
      "secretkey",
      {expiresIn:"1d"}
    )

    res.status(200).json({
      message:"Login successful",
      token,
      user:{
        id:user._id,
        firstname:user.firstname,
        lastname:user.lastname,
        email:user.email,
        role:user.role,
        status:user.status
      }
    })

  }
  catch(err){
    res.status(500).json({message:"Server error"})
  }

}


// PROFILE API
exports.getProfile = async (req,res)=>{

  try{

    const user = await User.findById(req.user.id).select("-password")

    if(!user){
      return res.status(404).json({
        message:"User not found"
      })
    }

    res.status(200).json({
      id:user._id,
      firstname:user.firstname,
      lastname:user.lastname,
      email:user.email,
      role:user.role,
      status:user.status
    })

  }
  catch(err){
    res.status(500).json({message:"Server error"})
  }

}