const express = require("express")
const router = express.Router()

const {registerUser} = require("../controller/userController.js")
const {loginUser} = require("../controller/userController.js")
const {getProfile} = require("../controller/userController.js")
const authMiddleware = require("../middleware/authmiddleware.js")

router.post("/signup", registerUser)
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getProfile)

module.exports = router