const express = require("express")
const router = express.Router()

const {registerUser,loginUser, getProfile, sendOtp, updateUserStatus, deleteUser, updateUserRole} = require("../controllers/userController.js")
const authMiddleware = require("../middleware/authmiddleware.js")

router.post("/send-otp", sendOtp)
router.post("/signup", registerUser)
router.post("/login", loginUser)
router.put("/api/admin/users/:id/status", updateUserStatus)
router.delete("/api/admin/users/:id", deleteUser)
router.put("/api/admin/users/:id/role", updateUserRole)
router.get("/profile", authMiddleware, getProfile)
// router.get( authMiddleware)

module.exports = router