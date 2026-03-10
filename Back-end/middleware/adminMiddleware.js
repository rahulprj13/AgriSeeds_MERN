const User = require("../models/UserModel.js");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = user;

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminMiddleware;

