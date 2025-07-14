// // import express from "express";
// // import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// // import { createCourtSubscription } from "../controllers/paymentController.js";

// // const router = express.Router();

// // router.post(
// //   "/court-subscription",
// //   protect,
// //   authorizeRoles("court_owner"),
// //   createCourtSubscription
// // );

// // export default router;
// import express from "express";
// import stripe from "../config/stripe.js";
// import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Create Stripe Checkout Session
// router.post("/create-subscription", protect, authorizeRoles("court_owner"), async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: 'Court Owner Subscription',
//           },
//           unit_amount: 1000 * 10, // $10/month
//           recurring: { interval: 'month' },
//         },
//         quantity: 1,
//       }],
//       success_url: `${process.env.FRONTEND_URL}/subscription-success`,
//       cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
//       customer_email: req.user.email,
//       metadata: {
//         userId: req.user._id.toString(),
//       },
//     });

//     res.status(200).json({ url: session.url });
//   } catch (err) {
//     console.error("Stripe session error:", err);
//     res.status(500).json({ message: "Failed to create session", error: err.message });
//   }
// });

// export default router;


// routes/subscriptionRoutes.js
// import express from 'express';
// import { createSubscriptionSession } from '../controllers/subscriptionController.js';

// const router = express.Router();

// // @route   POST /api/subscribe
// router.post('/subscribe', createSubscriptionSession);

// export default router;


import express from 'express';
import { createSubscriptionSession } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js'; // <--- 1. Import your protect middleware

const router = express.Router();

// @route   POST /api/subscribe
// Add 'protect' middleware to ensure the user is authenticated and req.user is populated
router.post('/subscribe', protect, createSubscriptionSession); // <--- 2. Add 'protect' here

export default router;