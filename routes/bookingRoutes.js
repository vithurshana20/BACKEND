import express from "express";
import {
  bookSlot, // ✅ use this instead of bookCourt
  getMyBookings,
  getCourtBookings,
  cancelBooking,
  getSlots, // optional: for frontend slot view
  blockTimeSlot,
} from "../controllers/bookingController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
// import { checkSubscription } from "../middleware/checkSubscription.js";
const router = express.Router();

// Get available slots for a specific date
router.get("/slots", protect, getSlots); // Example: /api/bookings/slots?courtId=xxx&date=yyyy-mm-dd

// Book a slot
router.post("/book", protect, authorizeRoles("player"), 
// checkSubscription, 
bookSlot);

// Get current user's bookings
router.get("/my-bookings", protect, authorizeRoles("player"), getMyBookings);

// Get all bookings for courts (court owner/admin)
router.get("/court-bookings", protect, authorizeRoles("court_owner", "admin"), getCourtBookings);

// Cancel booking (within 30 min)
router.delete("/:id/cancel", protect, authorizeRoles("player"), cancelBooking);

// Block a time slot (court owner)
router.post(
  "/block-slot",
  protect,
  authorizeRoles("court_owner"),
  blockTimeSlot
);

export default router;
