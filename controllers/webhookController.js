
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Find the user by their Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          // Update subscription status
          user.subscriptionStatus = "active";
          user.subscriptionId = subscriptionId;
          await user.save();
        } else {
          console.error(`No user found with Stripe customer ID: ${customerId}`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const session = event.data.object;
        const customerId = session.customer;

        // Find the user by their Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          // Update subscription status
          user.subscriptionStatus = "inactive";
          await user.save();
        } else {
          console.error(`No user found with Stripe customer ID: ${customerId}`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find the user by their Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          user.subscriptionStatus = "inactive";
          user.subscriptionId = null; // Clear the subscription ID
          await user.save();
        } else {
          console.error(`No user found with Stripe customer ID: ${customerId}`);
        }
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;

        const user = await User.findById(userId);

        if (user) {
          user.subscriptionStatus = "active";
          user.subscriptionId = subscriptionId;
          user.stripeCustomerId = session.customer;
          await user.save();
        } else {
          console.error(`No user found with ID: ${userId}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(" Webhook handling failed:", err);
    res.status(500).send("Internal Server Error");
  }
};
