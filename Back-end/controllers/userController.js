const User = require("../models/UserModel.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mailSend = require("../utils/MailUtil.js")
const Otp = require("../models/registerOtpModel.js")

// LOGIN
exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid Email" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" })
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        status: user.status
      }
    })

  }
  catch (err) {
    res.status(500).json({ message: "Server error" })
  }

}


// PROFILE API
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    res.status(200).json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status
    })

  }
  catch (err) {
    res.status(500).json({ message: "Server error" })
  }

}

// REGISTER
exports.registerUser = async (req, res) => {

  try {

    const { firstname, lastname, email, password, otp } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    // VERIFY OTP
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found"
      })
    }

    if (otpRecord.otp != otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    })

    await mailSend(
      user.email,
      "Welcome to our app",
      "Thank you for registering with our app."
    )

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    })

  }
  catch (err) {
    res.status(500).json({ message: "Server error" })
  }

}
//email otp
exports.sendOtp = async (req, res) => {

  try {

    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000)

    await Otp.create({
      email,
      otp
    })

    await mailSend(
      email,
      "Your OTP Code",
      `Your OTP is ${otp}`
    )

    res.status(200).json({
      message: "OTP sent successfully"
    })

  }
  catch (err) {
    res.status(500).json({
      message: "Error sending OTP"
    })
  }

}