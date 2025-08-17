import Booking from "../models/Booking.js";
import Court from "../models/Court.js";
import { addDays, format, startOfToday, endOfMonth, isAfter } from "date-fns";

// 🔧 Helper to generate slots from 6AM to 10PM
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    slots.push({
      start: `${h.toString().padStart(2, "0")}:00`,
      end: `${(h + 1).toString().padStart(2, "0")}:00`,
      status: "available",
    });
  }
  return slots;
};

// ✅ Get available/booked slots from today until month end
export const getSlots = async (req, res) => {
  const { courtId } = req.query;

  if (!courtId) {
    return res.status(400).json({ message: "courtId is required" });
  }

  try {
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // Ensure availableTimes is a Map
    if (!(court.availableTimes instanceof Map)) {
      court.availableTimes = new Map(Object.entries(court.availableTimes || {}));
    }

    const today = startOfToday();
    const monthEnd = endOfMonth(today);
    let currentDay = today;
    const slotsByDate = {};

    while (!isAfter(currentDay, monthEnd)) {
      const dateStr = format(currentDay, "yyyy-MM-dd");

      if (!court.availableTimes.has(dateStr)) {
        const slots = generateTimeSlots();
        court.availableTimes.set(dateStr, slots);
      }

      slotsByDate[dateStr] = court.availableTimes.get(dateStr) || [];
      currentDay = addDays(currentDay, 1);
    }

    await court.save();
    res.status(200).json({ slotsByDate });
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
};

// ✅ Book a slot (only if available)
export const bookSlot = async (req, res) => {
  const { courtId, bookingDate, start, end } = req.body;

  if (!courtId || !bookingDate || !start || !end) {
    return res.status(400).json({ message: "courtId, bookingDate, start, and end are required" });
  }

  try {
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    if (!court.isApproved) {
      return res.status(403).json({ message: "Booking not allowed for unapproved courts." });
    }

    let slots = court.availableTimes.get(bookingDate);
    if (!slots) {
      slots = generateTimeSlots();
      court.availableTimes.set(bookingDate, slots);
      court.markModified("availableTimes");
      await court.save();
    }

    const slot = slots.find((s) => s.start === start && s.end === end);
    if (!slot) {
      return res.status(400).json({ message: "This time slot does not exist." });
    }
    if (slot.status !== "available") {
      return res.status(400).json({ message: `This time slot is already ${slot.status}.` });
    }

    // Book slot
    slot.status = "booked";
    court.markModified("availableTimes");
    await court.save();

    const booking = new Booking({
      player: req.user._id,
      court: courtId,
      bookingDate,
      start,
      end,
      status: "booked",
    });

    await booking.save();
    res.status(201).json({ message: "Slot booked successfully", booking });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

// ✅ Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.player.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    const now = new Date();
    const diffMinutes = (now - new Date(booking.createdAt)) / (1000 * 60);
    if (diffMinutes > 30) {
      return res.status(400).json({ message: "Cancellation window expired (30 mins passed)" });
    }

    booking.status = "cancelled";
    await booking.save();

    const court = await Court.findById(booking.court);
    const slots = court.availableTimes.get(booking.bookingDate);
    const slot = slots.find((s) => s.start === booking.start && s.end === booking.end);
    if (slot) {
      slot.status = "available";
      court.markModified("availableTimes");
      await court.save();
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};

// ✅ Get all bookings for this player
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ player: req.user._id }).populate("court");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your bookings" });
  }
};

// ✅ Get all bookings (admin or owner)
export const getCourtBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("player", "name email")
      .populate("court", "name location");

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching court bookings" });
  }
};

// ✅ Block time slot for court owners
export const blockTimeSlot = async (req, res) => {
  try {
    const { courtId, date, start, end } = req.body;

    if (!courtId || !date || !start || !end) {
      return res.status(400).json({ message: "courtId, date, start, and end are required" });
    }

    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    // 👤 Check court ownership
    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to block this court's slots" });
    }

    // 🛠 Ensure availableTimes is a Map
    if (!(court.availableTimes instanceof Map)) {
      court.availableTimes = new Map(Object.entries(court.availableTimes || {}));
    }

    // 🗓 Ensure slot array exists for the date
    let slots = court.availableTimes.get(date);
    if (!slots) {
      slots = generateTimeSlots();
      court.availableTimes.set(date, slots);
    }

    const slot = slots.find((s) => s.start === start && s.end === end);

    if (!slot) {
      return res.status(404).json({ message: "Time slot not found for the specified date" });
    }

    if (slot.status === "booked") {
      return res.status(400).json({ message: "This slot is already booked and cannot be blocked" });
    }

    if (slot.status === "blocked") {
      return res.status(400).json({ message: "This slot is already blocked" });
    }

    // ✅ Block the slot
    slot.status = "blocked";

    // Save the updated slot array back
    court.availableTimes.set(date, slots);

    // Mark and save
    court.markModified("availableTimes");
    await court.save();

    return res.status(200).json({
      message: "Slot successfully blocked",
      courtId,
      date,
      start,
      end,
      updatedStatus: slot.status,
    });
  } catch (error) {
    console.error("Slot block error:", error);
    res.status(500).json({ message: "Error blocking slot", error: error.message });
  }
};




export const getBlockedSlotsByCourt = async (req, res) => {
  try {
    const { courtId } = req.params;
    const court = await Court.findById(courtId);

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    const blockedSlots = [];

    // Loop through availableTimes (Map of date => slots[])
    for (const [date, slots] of court.availableTimes.entries()) {
      slots.forEach((slot) => {
        if (slot.status === "blocked") {
          blockedSlots.push({
            date,
            start: slot.start,
            end: slot.end,
          });
        }
      });
    }

    return res.status(200).json({ blockedSlots });
  } catch (error) {
    console.error("Error fetching blocked slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};
