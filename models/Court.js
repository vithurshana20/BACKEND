// import mongoose from "mongoose";

// // // Slot schema — reused in Map for each date
// const timeSlotSchema = new mongoose.Schema({
//   start: { type: String, required: true },     // Example: "09:00"
//   end:   { type: String, required: true },     // Example: "10:00"
//   status:{ type: String, enum: ["available", "booked", "blocked"], default: "available" }
// }, { _id: false });

// // Main Court schema
// const courtSchema = new mongoose.Schema({
//   name:         { type: String, required: true },
//   location:     { type: String, required: true },
//   images:       [{ type: String, required: true }], // Cloudinary URLs or local

//   pricePerHour: { type: Number, required: true },

//   // Approval system (for admin dashboard)
//   isApproved:   { type: Boolean, default: false },

// // subscriptionId:     { type: String },             // Stripe subscription ID
// //   subscriptionEnd:    { type: Date },               // When it expires
// //   subscriptionExpiresAt: { type: Date },            // Optional alias
// //   active:             { type: Boolean, default: false }, // Active only when paid

//   // Court owner reference
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
  

//   // Contact details (required for court listing)
//   contact: {
//     phone:   { type: String, required: true },
//     mapLink: { type: String, required: true }
//   },

//   // Dynamic availability: Map of "yyyy-mm-dd" → timeSlot[]
//   availableTimes: {
//     type: Map,
//     of: [timeSlotSchema],
//     default: {}
//   },
// blockedTimes: {
//   type: Map,
//   of: [
//     {
//       start: String,
//       end: String,
//       reason: String, // optional
//       blockedByOwner: { type: Boolean, default: true },
//     }
//   ],
//   default: new Map(),
// },
// }, { timestamps: true });

// export default mongoose.model("Court", courtSchema);


import mongoose from "mongoose";

// Slot schema — reused in Map for each date
const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true },     // Example: "09:00"
  end:   { type: String, required: true },     // Example: "10:00"
  status:{ type: String, enum: ["available", "booked", "blocked"], default: "available" }
}, { _id: false });

// Main Court schema
const courtSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  location:     { type: String, required: true },
  images:       [{ type: String, required: true }], // Cloudinary URLs or local

  pricePerHour: { type: Number, required: true },

  // Approval system (for admin dashboard)
  isApproved:   { type: Boolean, default: false },

  // --- NEW SUBSCRIPTION FIELDS ---
  stripeCustomerId: {
      type: String, // Stripe Customer ID associated with THIS court
      unique: true, // Each court should have a unique customer ID in Stripe
      sparse: true  // Allows multiple null values, but unique if present
  },
  stripeSubscriptionId: {
      type: String, // Stripe Subscription ID for the active subscription of THIS court
      unique: true, // Each active subscription ID should be unique across courts
      sparse: true
  },
  subscriptionStatus: {
      type: String,
      // Common Stripe subscription statuses, plus a 'disabled' status for your app logic
      enum: ['active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing', 'ended', 'disabled', 'free_tier'],
      default: 'free_tier', // Default to 'free_tier' or 'disabled' when a court is first created
      required: true
  },
  subscriptionExpiryDate: {
      type: Date, // The date when the current subscription period ends
      default: null
  },
  // You might also want to store the `priceId` to know which plan the court is on
  stripePriceId: {
      type: String,
      default: null
  },
  // -------------------------------

  // Court owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Contact details (required for court listing)
  contact: {
    phone:   { type: String, required: true },
    mapLink: { type: String, required: true }
  },

  // Dynamic availability: Map of "yyyy-mm-dd" → timeSlot[]
  availableTimes: {
    type: Map,
    of: [timeSlotSchema],
    default: {}
  },
  blockedTimes: {
    type: Map,
    of: [
      {
        start: String,
        end: String,
        reason: String, // optional
        blockedByOwner: { type: Boolean, default: true },
      }
    ],
    default: new Map(),
  },
}, { timestamps: true });

export default mongoose.model("Court", courtSchema);