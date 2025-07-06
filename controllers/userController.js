// import User from '../models/Player.js';

// export const checkSubscriptionStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     const now = new Date();
//     const trialStart = new Date(user.createdAt);
//     const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);

//     let isInTrial = now < trialEnd;
//     let isSubscribed = user.isSubscribed || false;

//     if (!isSubscribed && !isInTrial) {
//       return res.status(403).json({ 
//         message: "Trial expired. Please subscribe to continue.",
//         trialEnded: true,
//         subscription: false 
//       });
//     }

//     res.json({
//       message: "Access allowed",
//       trialEndsAt: trialEnd,
//       isInTrial,
//       isSubscribed
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
// export const subscribeUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.isSubscribed = true;
//     user.subscriptionStartedAt = new Date();
//     user.subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

//     await user.save({ validateBeforeSave: false }); // 🔑 This line disables full validation

//     res.json({ message: "Subscription activated", user });
//   } catch (error) {
//     res.status(500).json({ message: "Subscription failed", error: error.message });
//   }
// };
