// // import express from "express";
// // import { handleStripeWebhook } from "../controllers/webhookController.js";

// // const router = express.Router();

// // // Stripe raw body needed
// // router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

// // export default router;
// import express from "express";
// import stripe from "../config/stripe.js";
// import User from "../models/User.js";
// const router = express.Router();

// // Use raw body parser for Stripe
// router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   try {
//     const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const userId = session.metadata.userId;

//       // Mark user as subscribed
//       await User.findByIdAndUpdate(userId, {
//         isSubscribed: true,
//         subscriptionId: session.subscription,
//         subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//       });
//     }

//     res.json({ received: true });
//   } catch (err) {
//     console.error("Webhook error:", err.message);
//     res.status(400).send(`Webhook Error: ${err.message}`);
//   }
// });

// export default router;


// routes/webhookRoutes.js
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';
import bodyParser from 'body-parser';

const router = express.Router();

// Stripe requires raw body parser for webhook
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
