
import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Court model is not directly used for initial subscription creation in this flow,
// but keep it imported if used elsewhere in the file or for type hinting.
import Court from '../models/Court.js';
import User from '../models/User.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to create or retrieve a Stripe Customer for the owner
// This customer will hold all subscriptions for this owner.
const createOrGetStripeCustomerForOwner = async (ownerId, ownerEmail, ownerName) => {
  let user = await User.findById(ownerId);
  if (!user) {
    throw new Error('User not found for subscription process.');
  }

  // If owner already has a Stripe Customer ID, use it
  if (user.stripeCustomerId) {
    return { customerId: user.stripeCustomerId };
  } else {
    // Otherwise, create a new Stripe Customer
    const customer = await stripe.customers.create({
      email: ownerEmail, // Use the owner's email for the customer record
      name: ownerName,
      metadata: {
        userId: ownerId.toString() // Link the Stripe customer to your internal owner ID
      }
    });
    // Save the new Stripe Customer ID to your owner model
    user.stripeCustomerId = customer.id;
    await user.save();
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

    const user = await User.findById(ownerId);
    if (!user) {
        return res.status(404).json({ error: 'User details not found in the database.' });
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
      user.email,
      user.name
    );

    // Create the Stripe Checkout Session
 const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
line_items: [
  {
    price: priceId, // This should be a valid recurring price ID like 'price_1Rk194QrTfa5cfnq4GOQSpLg'
    quantity: 1,
  },
],
  success_url: `http://localhost:5173/owner/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `http://localhost:5173/owner/subscription?payment_status=cancelled`,
customer: customerId,
  metadata: {
userId: user._id.toString(),
    planType: planType            // 'monthly' or 'yearly'
  }
});


    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Creation Error:', error);
    res.status(500).json({ error: error.message || "Unable to create subscription session. Please check server logs for details." });
  }
};




export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    console.log("🔍 Session ID received from frontend:", sessionId);

    // Check if sessionId is missing
    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("✅ Stripe session:", session);

    const customerId = session.customer;
    const subscriptionId = session.subscription;

    const user = await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      {
        subscriptionStatus: "active",
        stripeSubscriptionId: subscriptionId,
      },
      { new: true }
    );

    if (!user) {
      console.log("❌ No user found for customer ID:", customerId);
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ user, token });

  } catch (error) {
    console.error("❌ Stripe verification failed:", error);
    return res.status(500).json({ error: "Verification failed" });
  }
};



