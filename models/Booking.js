import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  player:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  court:       { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
  bookingDate: { type: String, required: true }, // "2025-06-12"
  start:       { type: String, required: true },
  end:         { type: String, required: true },
  status:      { type: String, enum: ["booked","cancelled"], default: "booked" }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);

