import mongoose from "mongoose";

// // Slot schema — reused in Map for each date
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


  active: { type: Boolean, default: false }, // Only active after payment
  subscriptionId: String, // Stripe subscription ID
  subscriptionEnd: Date   // Monthly expiry

}, { timestamps: true });

export default mongoose.model("Court", courtSchema);
