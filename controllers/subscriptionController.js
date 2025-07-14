// import stripe from "../utils/stripe.js";
// import Court from "../models/Court.js";
// import Owner from "../models/Owner.js";

// // Court owner subscription: ₹499/month
// const PLAN_PRICE_ID = "your_stripe_price_id_here"; // Create in Stripe dashboard

// export const createCourtSubscription = async (req, res) => {
//   try {
//   const owner = await Owner.findById(req.user._id);
// if (!owner) return res.status(404).json({ message: "Owner not found" });

// // Create Stripe customer
// if (!owner.stripeCustomerId) {
//   const customer = await stripe.customers.create({
//     email: owner.email,
//     name: owner.name,
//   });
//   owner.stripeCustomerId = customer.id;
//   await owner.save();
// }


//     // Create subscription session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "subscription",
//       customer: user.stripeCustomerId,
//       line_items: [
//         {
//           price: PLAN_PRICE_ID,
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.FRONTEND_URL}/owner/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/owner/payment-cancelled`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create subscription", error: err.message });
//   }
// };

// controllers/subscriptionController.js
// import Stripe from "stripe";
// import dotenv from "dotenv";
// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Create Stripe subscription checkout session
// export const createSubscriptionSession = async (req, res) => {
//   try {
//     const { planType, email } = req.body;

//     const priceId = planType === 'monthly'
//       ? 'price_1Rk194QrTfa5cfnq4GOQSpLg'  // Replace with your Stripe price ID
//       : 'price_1Rk1CVQrTfa5cfnqFx3xec1K';

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'subscription',
//       line_items: [{ price: priceId, quantity: 1 }],
//       customer_email: email,
//       success_url: `${process.env.FRONTEND_URL}/register-court?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       // success_url: `${process.env.CLIENT_URL}/owner-dashboard?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
//       // cancel_url: `${process.env.CLIENT_URL}/owner-dashboard?payment_status=cancelled`,
//     });

//     res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error(' Stripe Session Error:', error);
//     res.status(500).json({ error: "Unable to create subscription session" });
//   }
// };

import Stripe from "stripe";
import dotenv from "dotenv";
// Court model is not directly used for initial subscription creation in this flow,
// but keep it imported if used elsewhere in the file or for type hinting.
import Court from '../models/Court.js'; 
import User from '../models/Owner.js'; // Ensure this path is correct for your User/Owner model

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to create or retrieve a Stripe Customer for the owner
// This customer will hold all subscriptions for this owner.
const createOrGetStripeCustomerForOwner = async (ownerId, ownerEmail, ownerName) => {
  let owner = await User.findById(ownerId);
  if (!owner) {
    throw new Error('Owner not found for subscription process.');
  }

  // If owner already has a Stripe Customer ID, use it
  if (owner.stripeCustomerId) {
    return { customerId: owner.stripeCustomerId };
  } else {
    // Otherwise, create a new Stripe Customer
    const customer = await stripe.customers.create({
      email: ownerEmail, // Use the owner's email for the customer record
      name: ownerName,
      metadata: {
        ownerId: ownerId.toString() // Link the Stripe customer to your internal owner ID
      }
    });
    // Save the new Stripe Customer ID to your owner model
    owner.stripeCustomerId = customer.id;
    await owner.save();
    return { customerId: customer.id };
  }
};


// Create Stripe subscription checkout session for an owner (before court creation)
export const createSubscriptionSession = async (req, res) => {
  try {
    // *** IMPORTANT CHANGE: Only expect 'planType' from the frontend now. ***
    // 'courtId' is NOT sent by the frontend for the initial subscription in this flow.
    const { planType } = req.body; 
    // Owner ID comes from the authenticated user (via middleware)
    const ownerId = req.user._id; 

    // --- Input Validation ---
    if (!ownerId) {
      return res.status(401).json({ error: 'Authentication required: Owner ID missing.' });
    }
    // *** IMPORTANT CHANGE: Only validate planType. ***
    if (!planType) {
      return res.status(400).json({ error: 'Missing plan type for subscription (e.g., "monthly", "yearly").' });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
        return res.status(404).json({ error: 'Owner details not found in the database.' });
    }

    let priceId; // This will be your Stripe Price ID for the selected plan
    if (planType === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID; 
    } else if (planType === 'yearly') {
      priceId = process.env.STRIPE_YEARLY_PRICE_ID;   
    } else {
      // Catch-all for invalid plan types
      return res.status(400).json({ error: 'Invalid plan type provided. Must be "monthly" or "yearly".' });
    }

    // Ensure Price IDs are configured in your .env file
    if (!priceId) {
        console.error(`Stripe Price ID not found for planType: ${planType}. Check .env configuration.`);
        return res.status(500).json({ error: `Server configuration error: Stripe Price ID for ${planType} plan is missing.` });
    }

    // Get or create a Stripe Customer for this owner
    // This customer will manage all subscriptions for this owner.
    const { customerId } = await createOrGetStripeCustomerForOwner(
      ownerId,
      owner.email,
      owner.name
    );

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId, // Use the customer ID specifically tied to this owner
      
      // Pass crucial metadata to the session. This data will be available in Stripe webhooks
      // AND when you retrieve the session on the backend after redirect.
      metadata: {
        ownerId: ownerId.toString(), // Convert ObjectId to string for Stripe metadata
        planType: planType,
        // No courtId here, as the court doesn't exist yet.
      },

      // Construct success and cancel URLs.
      // We are redirecting back to the owner-dashboard, and will check for session_id there.
      success_url: `${process.env.FRONTEND_URL}/owner-dashboard?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/owner-dashboard?payment_status=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Creation Error:', error);
    res.status(500).json({ error: error.message || "Unable to create subscription session. Please check server logs for details." });
  }
};