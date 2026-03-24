const express = require("express")
const router = express.Router()

const {registerUser,loginUser, getProfile, sendOtp, updateUserStatus, deleteUser, updateUserRole, forgotPassword, resetPassword, adminCreateUser, adminUpdateUser, updateUserProfile, uploadProfileImage, getFullProfile} = require("../controllers/userController.js")
const authMiddleware = require("../middleware/authmiddleware.js")
const  upload  = require("../middleware/uploadMiddleware.js")

router.post("/send-otp", sendOtp)
router.post("/signup", registerUser)
router.post("/login", loginUser)

router.post("/api/admin/users",adminCreateUser) 
router.put("/api/admin/users/:id",adminUpdateUser)
router.put("/api/admin/users/:id/status", updateUserStatus)
router.delete("/api/admin/users/:id", deleteUser)
router.put("/api/admin/users/:id/role", updateUserRole)

router.get("/profile", authMiddleware, getProfile)
router.get("/user/profile", authMiddleware, getFullProfile)
router.put("/user/profile", authMiddleware, updateUserProfile)
router.post("/user/profileimage", authMiddleware, upload.single("profileImage"), uploadProfileImage)

router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword",resetPassword)

module.exports = router