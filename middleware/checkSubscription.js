// // export const checkSubscription = (req, res, next) => {
// //   const user = req.user;

// //   if (!user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const trialPeriodDays = 7;
// //   const registrationDate = new Date(user.registeredAt);
// //   const currentDate = new Date();
// //   const daysSinceRegister = Math.floor((currentDate - registrationDate) / (1000 * 60 * 60 * 24));

// //   if (daysSinceRegister <= trialPeriodDays || user.subscribed) {
// //     return next(); // Allow access
// //   }

// //   return res.status(403).json({
// //     message: "Your 7-day trial has ended. Please subscribe to continue.",
// //   });
// // };
// import User from "../models/User.js";

// export const checkSubscription = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (user.isSubscribed) return next();

//     const now = new Date();
//     if (user.trialEndsAt && now < user.trialEndsAt) return next();

//     return res.status(403).json({ message: "Trial expired. Please subscribe to continue." });
//   } catch (err) {
//     return res.status(500).json({ message: "Subscription check failed", error: err.message });
//   }
// };
// middleware/checkSubscription.js

// middleware/checkSubscription.js
export const checkSubscription = (req, res, next) => {
  const user = req.user;

  const now = new Date();
  const createdAt = new Date(user.createdAt);
  const freeTrialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const isInFreeTrial = now <= freeTrialEnd;
  const isSubscribed = user.isSubscribed || false;
  const subscriptionEndsAt = user.subscriptionEndsAt || null;

  if (isSubscribed && (!subscriptionEndsAt || new Date(subscriptionEndsAt) >= now)) {
    return next(); // Valid subscription
  }

  if (isInFreeTrial) {
    return next(); // Still in free trial
  }

  return res.status(403).json({
    message: "Subscription expired. Please subscribe to continue.",
  });
};
