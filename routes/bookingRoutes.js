import express from "express";
import {
  bookSlot,            
  getMyBookings,        
  getCourtBookings,     
  cancelBooking,        
  getSlots,          
  blockTimeSlot,        
} from "../controllers/bookingController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { checkSubscription } from "../middleware/checkSubscription.js";

const router = express.Router();

// ✅ Get available slots (for players to book)
router.get("/slots", protect, getSlots); 
// Example: /api/bookings/slots?courtId=xxx&date=yyyy-mm-dd

// ✅ Book a slot
router.post(
  "/book",
  protect,
  authorizeRoles("player"),
  // checkSubscription, // Optional: enable if you require active subscription
  bookSlot
);

// ✅ Get logged-in player's bookings
router.get("/my-bookings", protect, authorizeRoles("player"), getMyBookings);

// ✅ Get all bookings (admin / court_owner)
router.get("/court-bookings", protect, authorizeRoles("court_owner", "admin"), getCourtBookings);

// ✅ Cancel booking
router.delete("/:id/cancel", protect, authorizeRoles("player"), cancelBooking);

// ✅ Block a time slot (owner only)
router.post(
  "/block-slot",
  protect,
  authorizeRoles("court_owner"),
  blockTimeSlot
);

export default router;
