const express = require("express")
const router = express.Router()

const registerUser = require("../controller/SignUp.js")
const loginUser = require("../controller/Login.js")

router.post("/signup", registerUser)
router.post("/login", loginUser)

module.exports = router