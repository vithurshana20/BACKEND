// import express from 'express';
// import { protect } from '../middleware/authMiddleware.js';
// // import { checkSubscriptionStatus } from '../controllers/userController.js';

// const router = express.Router();

// router.get('/subscription-status', protect);

// export default router;
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkSubscription } from '../middleware/checkSubscription.js';
import { subscribeUser } from "../controllers/userController.js";

const router = express.Router();


router.post("/subscribe", protect, subscribeUser); // 👈 Subscription route
router.get('/check-subscription', protect, checkSubscription, (req, res) => {
  res.json({ message: 'Access granted. You have a valid subscription or trial.' });
});

export default router;
