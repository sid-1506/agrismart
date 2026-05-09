const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: generate JWT ──
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Helper: send token response ──
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:       user._id,
      name:     user.name,
      email:    user.email,
      location: user.location,
      language: user.language,
    },
  });
};

// ─────────────────────────────────────────
//  POST /api/auth/signup
// ─────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, location, language } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, location, language });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Need password field (select: false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
//  PUT /api/auth/update-profile  (protected)
// ─────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, location, language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, location, language },
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
//  PATCH /api/auth/profile  (protected)
//  Partial update — only fields sent are changed
// ─────────────────────────────────────────
exports.patchProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "location", "language"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
//  GET /api/auth/me  (protected) — explicit field selection
// ─────────────────────────────────────────
// getMe already defined above; we re-export a safe version
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
//  POST /api/auth/change-password  (protected)
// ─────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must differ from current password" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.password) {
      return res.status(400).json({ success: false, message: "Password change not available for this account" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
