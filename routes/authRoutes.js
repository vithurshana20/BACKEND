import express from 'express';
import passport from "passport";
import {
  registerPlayer,
  registerOwner,
  loginUser,
  logoutUser,
  getCurrentUser // ✅ Add this
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Player Registration
router.post('/register/player', registerPlayer);

// ✅ Owner Registration
router.post('/register/owner', registerOwner);

// ✅ Login
router.post('/login', loginUser);

// ✅ Logout
router.post('/logout', protect, logoutUser);

// ✅ Profile Route (used by PlayerDashboard)
router.get('/profile', protect, getCurrentUser);

// ✅ Google Login (social login)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google Login Callback
// 2. Callback URL from Google
router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login', // frontend login page
    session: true,
  }),
  (req, res) => {
    // After successful auth
    const user = req.user;
    const token = user.generateToken(); // Assuming you have a method to generate JWT
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);

export default router;
