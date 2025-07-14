// export const checkSubscription = (req, res, next) => {
//   if (!req.user.isSubscribed || new Date(req.user.subscriptionExpires) < new Date()) {
//     return res.status(403).json({ message: "Subscription required to register courts." });
//   }
//   next();
// };
