
import express from 'express';
import { createSubscriptionSession, verifySession } from '../controllers/subscriptionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/subscribe
// Add 'protect' middleware to ensure the user is authenticated and req.user is populated
router.post('/', protect, authorizeRoles('court_owner'), createSubscriptionSession);
router.post("/verify-session", verifySession);

export default router;

