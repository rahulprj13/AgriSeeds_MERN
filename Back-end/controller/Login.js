const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// LOGIN
exports.loginUser = async (req,res)=>{

  try{

    const {email,password} = req.body

    const user = await User.findOne({email})

    if(!user){
      return res.status(400).json({message:"Invalid credentials"})
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
      return res.status(400).json({message:"Invalid credentials"})
    }

    const token = jwt.sign(
      {id:user._id},
      "secretkey",
      {expiresIn:"1d"}
    )

    res.json({
      message:"Login successful",
      token
    })

  }
  catch(err){
    res.status(500).json({message:"Server error"})
  }

}