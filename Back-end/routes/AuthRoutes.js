const express = require("express")
const router = express.Router()

const {registerUser,loginUser, getProfile, sendOtp, updateUserStatus, deleteUser, updateUserRole, forgotPassword, resetPassword, adminCreateUser, adminUpdateUser} = require("../controllers/userController.js")
const authMiddleware = require("../middleware/authmiddleware.js")

router.post("/send-otp", sendOtp)
router.post("/signup", registerUser)
router.post("/login", loginUser)

router.post("/api/admin/users",adminCreateUser) 
router.put("/api/admin/users/:id",adminUpdateUser)
router.put("/api/admin/users/:id/status", updateUserStatus)
router.delete("/api/admin/users/:id", deleteUser)
router.put("/api/admin/users/:id/role", updateUserRole)

router.get("/profile", authMiddleware, getProfile)

router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword",resetPassword)
// router.get( authMiddleware)

module.exports = router