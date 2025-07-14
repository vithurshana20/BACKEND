// import stripe from "../utils/stripe.js";
// import Court from "../models/Court.js";
// import Owner from "../models/Owner.js"

// export const handleStripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle event
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const customerId = session.customer;
//     const subscriptionId = session.subscription;

// const owner = await Owner.findOne({ stripeCustomerId: customerId });
//     if (!owner) return res.status(404).end();

//     // Set court active and save subscription data
// const latestCourt = await Court.findOne({ owner: owner._id }).sort({ createdAt: -1 });

//     if (latestCourt) {
//       const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//       latestCourt.subscriptionId = subscription.id;
//       latestCourt.subscriptionEnd = new Date(subscription.current_period_end * 1000); // Convert from seconds
//       latestCourt.active = true;
//       await latestCourt.save();
//     }
//   }

//   res.status(200).end();
// };


// controllers/webhookController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import Owner from "../models/Owner.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update your DB: mark subscription active for this email
      const customerEmail = session.customer_email;
      await Owner.findOneAndUpdate(
        { email: customerEmail },
        {
          subscriptionStatus: "active",
          subscriptionId: session.subscription,
          // Optional: Set expiry date if needed
        }
      );
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      await Owner.findOneAndUpdate(
        { email: email },
        { subscriptionStatus: "inactive" }
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(" Webhook handling failed:", err);
    res.status(500).send("Internal Server Error");
  }
};
