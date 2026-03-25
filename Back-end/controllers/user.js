// const User = require("../models/UserModel.js")
// const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")
// const crypto = require("crypto")
// const mailSend = require("../utils/MailUtil.js")
// const Otp = require("../models/registerOtpModel.js")
// const uploadToCloudinary = require("../utils/cloudinaryUtils.js")
// const secret = "secret"

// // admincrate user
// exports.adminCreateUser = async (req, res) => {
//   try {
//     const { firstname, lastname, mobile, email, password, role, status } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       firstname,
//       lastname,
//       mobile,
//       email,
//       password: hashedPassword,
//       role,
//       status,
//     });

//     res.status(201).json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //admin updateuser
// exports.adminUpdateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { firstname, lastname, mobile, email, password, role, status } = req.body;

//     const existingUser = await User.findById(id);

//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // check duplicate email except current user
//     if (email) {
//       const emailExists = await User.findOne({
//         email,
//         _id: { $ne: id },
//       });

//       if (emailExists) {
//         return res.status(400).json({
//           message: "Email already exists",
//         });
//       }
//     }

//     const updateData = {
//       firstname,
//       lastname,
//       mobile,
//       email,
//       role,
//       status,
//     };

//     if (password && password.trim() !== "") {
//       updateData.password = await bcrypt.hash(password, 10);
//     }

//     const user = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     return res.status(200).json({
//       message: "User updated successfully",
//       user,
//     });
//   } catch (err) {
//     console.log("adminUpdateUser error:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

// // LOGIN
// exports.loginUser = async (req, res) => {

//   try {

//     const { email, password } = req.body

//     const user = await User.findOne({ email })

//     // Check if user is inactive
//     if (user.status === 'inactive') {
//       return res.status(403).json({ message: "Your account is inactive. Please contact support." })
//     }
//     // Check if user is blocked
//     if (user.status === 'blocked') {
//       return res.status(403).json({ message: "Your account is blocked. Please contact support." })
//     }

//     if (!user) {
//       return res.status(400).json({ message: "Invalid Email" })
//     }

//     const isMatch = await bcrypt.compare(password, user.password)

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid Password" })
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       "secretkey",
//       { expiresIn: "1d" }
//     )

//     const profileImage = user.profileImage
//       ? user.profileImage.startsWith("http")
//         ? user.profileImage
//         : `http://localhost:5000/uploads/${user.profileImage}`
//       : null;

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//         profileImage,
//       }
//     })

//   }
//   catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }

// }

// //  Block/Unblock User
// exports.updateUserStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body; // 'active' or 'blocked'
//     await User.findByIdAndUpdate(id, { status });
//     res.json({ message: "User status updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update status" });
//   }
// };

// //  Delete User
// exports.deleteUser = async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted permanently" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// };

// // change user role
// exports.updateUserRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body; // 'admin' or 'user'
//     await User.findByIdAndUpdate(id, { role });
//     res.json({ message: "Role updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update role" });
//   }
// };

// // PROFILE API
// exports.getProfile = async (req, res) => {

//   try {

//     const user = await User.findById(req.user.id).select("-password")

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       })
//     }

//     const profileImage = user.profileImage
//       ? user.profileImage.startsWith("http")
//         ? user.profileImage
//         : `http://localhost:5000/uploads/${user.profileImage}`
//       : null;

//     res.status(200).json({
//       id: user._id,
//       firstname: user.firstname,
//       lastname: user.lastname,
//       email: user.email,
//       role: user.role,
//       status: user.status,
//       profileImage,
//     })

//   }
//   catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }

// }

// // REGISTER
// exports.registerUser = async (req, res) => {
//   try {
//     const { firstname, lastname, mobile, email, password, otp } = req.body;

//     const userExists = await User.findOne({ email });

//     if (userExists) {
//       return res.status(400).json({
//         message: "User already exists",
//       });
//     }

//     // latest OTP record
//     const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

//     if (!otpRecord) {
//       return res.status(400).json({
//         message: "OTP not found",
//       });
//     }

//     // OTP match check
//     if (otpRecord.otp != otp) {
//       return res.status(400).json({
//         message: "Invalid OTP",
//       });
//     }

//     // OTP expiry check
//     if (otpRecord.expiresAt < new Date()) {
//       await Otp.deleteMany({ email });

//       return res.status(400).json({
//         message: "OTP expired",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       firstname,
//       lastname,
//       mobile,
//       email,
//       password: hashedPassword,
//     });

//     //  OTP delete after registration
//     await Otp.deleteMany({ email });

//     await mailSend(
//       user.email,
//       "Welcome to our app",
//       "Thank you for registering with our app."
//     );

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: user._id,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         mobile: user.mobile,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //email otp
// exports.sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // old OTP remove
//     await Otp.deleteMany({ email });

//     await Otp.create({
//       email,
//       otp,
//       expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds
//     });

//     await mailSend(
//       email,
//       "Your OTP Code",
//       `Your OTP is ${otp}. This OTP will expire in 60 seconds.`
//     );

//     res.status(200).json({
//       message: "OTP sent successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error sending OTP",
//     });
//   }
// };

// // forgot password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" })
//     }

//     const foundUserFromEmail = await User.findOne({ email: email })

//     if (!foundUserFromEmail) {
//       return res.status(404).json({ message: "Email not found" })
//     }

//     const token = crypto.randomBytes(32).toString("hex")
//     const expires = Date.now() + 5 * 60 * 1000 // 5 minutes

//     foundUserFromEmail.resetPasswordToken = token
//     foundUserFromEmail.resetPasswordExpires = new Date(expires)
//     await foundUserFromEmail.save()

//     const url = `http://localhost:5173/resetpassword/${token}`
//     const mailtext = `Click <a href="${url}">here</a> to reset your password. This link will expire in 5 minutes.`

//     await mailSend(foundUserFromEmail.email, "Password Reset Link", mailtext)

//     res.status(200).json({ message: "Password reset link sent to your email" })
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: "Server error", error: error })
//   }
// }

// // reset password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token, newPassword } = req.body

//     if (!token || !newPassword) {
//       return res.status(400).json({ message: "Token and new password are required" })
//     }

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     })

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired reset token" })
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)
//     user.password = hashedPassword
//     user.resetPasswordToken = null
//     user.resetPasswordExpires = null
//     await user.save()

//     res.status(200).json({ message: "Password reset successfully" })

//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: "Server error", error: error })
//   }
// }

// // UPDATE USER PROFILE (for users)
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { firstname, lastname, mobile } = req.body;

//     const existingUser = await User.findById(userId);

//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // check duplicate mobile except current user
//     if (mobile) {
//       const mobileExists = await User.findOne({
//         mobile,
//         _id: { $ne: userId },
//       });

//       if (mobileExists) {
//         return res.status(400).json({
//           message: "Mobile number already exists",
//         });
//       }
//     }

//     const updateData = {};
//     if (firstname) updateData.firstname = firstname;
//     if (lastname) updateData.lastname = lastname;
//     if (mobile) updateData.mobile = mobile;

//     const user = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (err) {
//     console.log("updateUserProfile error:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

// // UPLOAD/UPDATE USER PROFILE IMAGE
// exports.uploadProfileImage = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!req.file) {
//       return res.status(400).json({ message: "No image file provided" });
//     }

//     const cloudinaryResponse = await uploadToCloudinary(req.file.path);

//     if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
//       return res.status(500).json({ message: "Image upload failed" });
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { profileImage: cloudinaryResponse.secure_url },
//       { new: true }
//     ).select("-password");

//     return res.status(200).json({
//       message: "Profile image uploaded successfully",
//       user,
//     });
//   } catch (err) {
//     console.log("uploadProfileImage error:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

// // GET FULL USER PROFILE
// exports.getFullProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     res.status(200).json(user);
//   } catch (err) {
//     console.log("getFullProfile error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
