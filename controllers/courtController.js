import Court from "../models/Court.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// 🔁 Generate time slots from 6AM to 10PM
const generateSlotsForDate = () => {
  const slots = [];
  for (let hour = 6; hour < 22; hour++) {
    slots.push({
      start: `${hour}:00`,
      end: `${hour + 1}:00`,
      status: "available"
    });
  }
  return slots;
};


// 🔁 Generate available time slots for the next 30 days
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

// ✅ Add a court (with subscription check)
// export const addCourt = async (req, res) => {
//   let { name, location, pricePerHour, contact } = req.body;

//   try {
//     // 🔐 Ensure user is authenticated
//     if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//     // 🔍 Find owner
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 🛑 Block if subscription is not active
//     if (user.subscriptionStatus !== "active") {
//       return res.status(403).json({ message: "You must have an active subscription to register a court." });
//     }

//     // 📦 Parse contact if it's a string (from multipart/form-data)
//     if (typeof contact === "string") {
//       contact = JSON.parse(contact);
//     }

//     const images = req.files?.map((file) => file.path) || [];

//     if (!name || !location || !pricePerHour || !contact?.phone || !contact?.mapLink || images.length === 0) {
//       return res.status(400).json({
//         message: "Name, location, price, phone, map link, and at least one image are required.",
//       });
//     }

//     // ✅ Create new court
//     const court = new Court({
//       name,
//       location,
//       pricePerHour,
//       images,
//       owner: req.user._id,
//       contact: {
//         phone: contact.phone,
//         mapLink: contact.mapLink,
//       },
//       availableTimes: generateAvailableTimes(),
//       isApproved: false,
//     });

//     await court.save();
//     res.status(201).json({ message: "Court submitted for approval", court });

//   } catch (err) {
//     console.error("Court add error:", err);
//     res.status(500).json({ message: "Error adding court", error: err.message });
//   }
// };




export const addCourt = async (req, res) => {
  let { name, location, pricePerHour, contact } = req.body;

  try {
    // 🔐 Ensure user is authenticated
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 🔍 Find owner
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛑 Block if subscription is not active
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({ message: "You must have an active subscription to register a court." });
    }

    // ✅ Check if court already exists for this user's subscription
    const existingCourt = await Court.findOne({
      owner: user._id,
      stripeSubscriptionId: user.stripeSubscriptionId,
    });

    if (existingCourt) {
      return res.status(403).json({
        message: "You have already registered a court with this subscription. Please upgrade or subscribe again to add more.",
      });
    }

    // 📦 Parse contact if it's a string (from multipart/form-data)
    if (typeof contact === "string") {
      contact = JSON.parse(contact);
    }

    const images = req.files?.map((file) => file.path) || [];

    if (!name || !location || !pricePerHour || !contact?.phone || !contact?.mapLink || images.length === 0) {
      return res.status(400).json({
        message: "Name, location, price, phone, map link, and at least one image are required.",
      });
    }

    // ✅ Create new court
    const court = new Court({
      name,
      location,
      pricePerHour,
      images,
      owner: req.user._id,
      stripeSubscriptionId: user.stripeSubscriptionId, // ✅ Link court to the subscription
      contact: {
        phone: contact.phone,
        mapLink: contact.mapLink,
      },
      availableTimes: generateAvailableTimes(),
      isApproved: false,
    });

    await court.save();
    res.status(201).json({ message: "Court submitted for approval", court });

  } catch (err) {
    console.error("Court add error:", err);
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
// export const approveCourt = async (req, res) => {
//   try {
//     const court = await Court.findById(req.params.id);
//     if (!court) return res.status(404).json({ message: 'Court not found' });

//     court.isApproved = true;
//     await court.save();

//     res.status(200).json({ message: 'Court approved successfully', court });
//   } catch (err) {
//     res.status(500).json({ message: 'Error approving court', error: err.message });
//   }
// };

// export const approveCourt = async (req, res) => {
//   try {
//     const court = await Court.findById(req.params.id).populate('owner', 'email name');
//     if (!court) return res.status(404).json({ message: 'Court not found' });

//     court.isApproved = true;
//     await court.save();

//     // Send email to owner
//     if (court.owner && court.owner.email) {
//       await sendEmail({
//         to: court.owner.email,
//         subject: "Your Court Has Been Approved!",
//         text: `Hello ${court.owner.name},\n\nYour court "${court.name}" has been approved and is now live on the platform.\n\nThank you!`
//       });
//     }

//     res.status(200).json({ message: 'Court approved successfully', court });
//   } catch (err) {
//     res.status(500).json({ message: 'Error approving court', error: err.message });
//   }
// };

export const approveCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).populate('owner', 'email name');
    if (!court) return res.status(404).json({ message: 'Court not found' });

    court.isApproved = true;
    await court.save();

    // Debug logging
    console.log('Court owner:', court.owner);
    console.log('Owner email:', court.owner?.email);
    console.log('Owner name:', court.owner?.name);

    // Send email to owner
    if (court.owner && court.owner.email) {
      try {
        await sendEmail({
          to: court.owner.email,
          subject: "Your Court Has Been Approved!",
          text: `Hello ${court.owner.name},\n\nYour court "${court.name}" has been approved and is now live on the platform.\n\nThank you!`
        });
        console.log('Email sent successfully to:', court.owner.email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the entire operation if email fails
      }
    } else {
      console.log('No owner email found, skipping email');
    }

    res.status(200).json({ message: 'Court approved successfully', court });
  } catch (err) {
    console.error('Error approving court:', err);
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




export const updateCourt = async (req, res) => {
  try {
    const { courtId } = req.params;

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    //  Only the owner can update their court
    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this court." });
    }

    let { name, location, pricePerHour, contact } = req.body;

    //  Parse contact if it's a string (from form-data)
    if (typeof contact === "string") {
      contact = JSON.parse(contact);
    }

    const updatedFields = {
      ...(name && { name }),
      ...(location && { location }),
      ...(pricePerHour && { pricePerHour }),
      ...(contact?.phone && { 'contact.phone': contact.phone }),
      ...(contact?.mapLink && { 'contact.mapLink': contact.mapLink }),
    };

    // Optional: Update images if new files uploaded
    if (req.files && req.files.length > 0) {
      updatedFields.images = req.files.map(file => file.path);
    }

    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({ message: "Court updated successfully", court: updatedCourt });
  } catch (err) {
    console.error("Error updating court:", err);
    res.status(500).json({ message: "Error updating court", error: err.message });
  }
};



export const deleteCourt = async (req, res) => {
  try {
    const { courtId } = req.params;

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    //  Only the owner can delete
    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this court." });
    }

    await Court.findByIdAndDelete(courtId);
    res.status(200).json({ message: "Court deleted successfully" });
  } catch (err) {
    console.error("Error deleting court:", err);
    res.status(500).json({ message: "Error deleting court", error: err.message });
  }
};
