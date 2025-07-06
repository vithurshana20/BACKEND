// // utils/cron.js
// import cron from "node-cron";
// import Court from "../models/Court.js";

// export const startSubscriptionExpiryCron = () => {
//   cron.schedule("0 0 * * *", async () => {
//     const now = new Date();
//     await Court.updateMany(
//       { subscriptionEnd: { $lt: now }, active: true },
//       { $set: { active: false } }
//     );
//     console.log("Expired courts deactivated");
//   });
// };
