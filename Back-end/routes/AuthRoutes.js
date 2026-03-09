const express = require("express")
const router = express.Router()

const {registerUser} = require("../controller/SignUp.js")
const {loginUser,getProfile} = require("../controller/Login.js")
const authMiddleware = require("../middleware/authmiddleware.js")

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getProfile)

module.exports = router