// const express = require("express");
// const router = express.Router();
// const { signup, login, getMe, updateProfile } = require("../controllers/authController");
// const { protect } = require("../middleware/auth");

// router.post("/signup",         signup);
// router.post("/login",          login);
// router.get("/me",              protect, getMe);
// router.put("/update-profile",  protect, updateProfile);

// module.exports = router;

// -----------------------------------------------------
const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const passport = require("../config/passport");
const { signup, login, getMe, updateProfile, patchProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// ── Standard email/password auth ──
router.post  ("/signup",          signup);
router.post  ("/login",           login);
router.get   ("/me",              protect, getMe);
router.put   ("/update-profile",  protect, updateProfile);
router.patch ("/profile",         protect, patchProfile);
router.post  ("/change-password", protect, changePassword);

// ── Google OAuth ──
// Step 1: redirect to Google consent screen
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2: Google redirects back with code — generate JWT and send to frontend
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const user = {
      id:       req.user._id,
      name:     req.user.name,
      email:    req.user.email,
      location: req.user.location,
      language: req.user.language,
    };

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(
      `${clientURL}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
);

module.exports = router;