// config/passport.js
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/Player.js";

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const existingUser = await User.findOne({ email: profile.emails[0].value });
  if (existingUser) return done(null, existingUser);

  const newUser = await User.create({
    name: profile.displayName,
    email: profile.emails[0].value,
    password: "google", // Dummy password
    role: "player",
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  done(null, newUser);
}));
