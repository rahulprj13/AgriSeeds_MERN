const express = require("express")
const router = express.Router()

const {registerUser,loginUser, getProfile, sendOtp} = require("../controller/userController.js")
const authMiddleware = require("../middleware/authmiddleware.js")

router.post("/send-otp", sendOtp)
router.post("/signup", registerUser)
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getProfile)
// router.get( authMiddleware)

module.exports = router