import express from 'express';
import passport from "passport";
import {
  registerPlayer,
  registerOwner,
  loginUser,
  logoutUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Player Registration
router.post('/register/player', registerPlayer);

// ✅ Owner Registration
router.post('/register/owner', registerOwner);

// ✅ Login
router.post('/login', loginUser);

// ✅ Logout (Requires authentication)
router.post('/logout', protect, logoutUser);

// ✅ Profile Route (for testing, optional)
router.get('/profile', protect, (req, res) => {
  res.send('User profile route');
});

// ✅ Google Login (social login)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google Login Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // 🔐 Create JWT token here (based on req.user)
    const token = "dummy-jwt-token"; // TODO: Replace with real generated token
    res.redirect(`${process.env.FRONTEND_URL}/social-success?token=${token}`);
  }
);

export default router;
