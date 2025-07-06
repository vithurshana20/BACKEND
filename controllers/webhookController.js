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
