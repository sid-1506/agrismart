const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), null);

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Existing user — just return them
          return done(null, user);
        }

        // New user — create account
        user = await User.create({
          name:     profile.displayName || email.split("@")[0],
          email,
          password: `google_oauth_${profile.id}_${Date.now()}`, // placeholder, won't be used
          location: "",
          language: "English",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Not using sessions — we use JWT instead
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
