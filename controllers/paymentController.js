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

