import Court from "../models/Court.js";

// 🔁 Helper: Generate time slots for next N days (default 30)
const generateSlotsForDate = () => {
  const slots = [];
  for (let hour = 9; hour < 22; hour++) {
    slots.push({
      start: `${hour}:00`,
      end: `${hour + 1}:00`,
      status: "available"
    });
  }
  return slots;
};

const generateAvailableTimes = (days = 30) => {
  const map = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split("T")[0];
    map[dateString] = generateSlotsForDate();
  }
  return map;
};

//  Add a court (Court Owner only)
export const addCourt = async (req, res) => {
  const { name, location, pricePerHour, contact } = req.body;

  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const images = req.files.map((file) => file.path); // Cloudinary URLs

    if (!name || !location || !pricePerHour || !contact?.phone || !contact?.mapLink || !images || images.length === 0) {
      return res.status(400).json({
        message:
          "Name, location, price per hour, contact phone, map link and at least one image are required",
      });
    }

    const court = new Court({
      name,
      location,
      pricePerHour,
      images,
      owner: req.user._id,
      contact: {
        phone: contact.phone,
        mapLink: contact.mapLink,
      },
      availableTimes: generateAvailableTimes(), // ⏱️ Pre-fill 30 days 9AM-10PM
      isApproved: false,
    });

    await court.save();
    res.status(201).json({ message: "Court submitted for approval", court });
  } catch (err) {
    res.status(500).json({ message: "Error adding court", error: err.message });
  }
};

//  Get all approved courts (Player & Admin view)
export const getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find({ isApproved: true });
    res.status(200).json(courts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courts", error: err.message });
  }
};

//  Get courts owned by the logged-in court owner
export const getMyCourts = async (req, res) => {
  try {
    const courts = await Court.find({ owner: req.user._id });
    res.status(200).json(courts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your courts", error: err.message });
  }
};

// Add available time slot (date-based)
export const addAvailableTime = async (req, res) => {
  const { courtId, date, start, end } = req.body;

  try {
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    const newSlot = { start, end, status: "available" };

    const currentSlots = court.availableTimes.get(date) || [];
    currentSlots.push(newSlot);
    court.availableTimes.set(date, currentSlots);

    court.markModified("availableTimes");
    await court.save();

    res.status(200).json({ message: "Available time added", court });
  } catch (error) {
    res.status(500).json({ message: "Failed to add time", error: error.message });
  }
};

//  Upload court image
export const uploadCourtImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const imagePath = req.file.path;
    res.status(200).json({ message: "Image uploaded", imageUrl: imagePath });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

//  Admin: Get all courts (including pending approval)
export const getAllCourtsForApproval = async (req, res) => {
  try {
    const courts = await Court.find().populate('owner', 'name email');
    res.status(200).json(courts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courts', error: err.message });
  }
};

// Admin: Approve a court
export const approveCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found' });

    court.isApproved = true;
    await court.save();

    res.status(200).json({ message: 'Court approved successfully', court });
  } catch (err) {
    res.status(500).json({ message: 'Error approving court', error: err.message });
  }
};

//  Admin: Reject a court
export const rejectCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found' });

    court.isApproved = false;
    await court.save();

    res.status(200).json({ message: 'Court rejected', court });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting court', error: err.message });
  }
};
