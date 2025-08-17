import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';

// import crypto from "crypto";
// import { sendEmail } from "../utils/sendEmail.js";

// JWT Token generator function
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


export const registerPlayer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const player = await User.create({
      name,
      email,
      phone,
      password,
      role: "player",
    });

    res.status(201).json({ message: "Player registered successfully." });
  } catch (err) {
    console.error("Player Register Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


export const registerOwner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const owner = await User.create({
      name,
      email,
      phone,
      password,
      role: "court_owner",
    });

    res.status(201).json({ message: "Court Owner registered successfully." });
  } catch (err) {
    console.error("Owner Register Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

//  Login User Controller 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//  Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
  const user = await User.findById(req.user.id).select('-password');
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}

// 👇 Include subscription info in response
res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  subscriptionStatus: user.subscriptionStatus || "inactive",
  subscriptionActive: user.subscriptionStatus === "active", // Optional boolean for frontend
});

    // Send extra field `subscriptionActive` for court_owner
    const subscriptionActive = user.role === 'court_owner' && user.subscriptionStatus === 'active';

    res.json({
      ...user.toObject(),
      subscriptionActive,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//  Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//  Update a user by ID (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Delete a user by ID (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Logout user (clear refresh token or session)
export const logoutUser = async (req, res) => {
  try {
    // If refresh token stored in cookies:
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Successfully logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};


// // Admin - Get all paid bookings
// export const getAllPayments = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ paymentStatus: "paid" })
//       .populate("player", "name email")
//       .populate("court", "name location pricePerHour");

//     res.status(200).json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch payments", error: err.message });
//   }
// }
export const getAllPayments = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('player', 'name email')
      .populate('court', 'name pricePerHour location');

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: err.message,
    });
  }
};

// google login code
// export const googleLogin = async (req, res) => {
//   try {
//     const { token } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, sub: googleId} = payload;
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         password: "google", // Dummy password, not used for login
//         role: "player",     // Use "player" or your default role
//         trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         googleId,
//       });
//     }

//     const jwtToken = generateToken(user._id);

//     res.status(200).json({
//       message: "Login successful",
//       token: jwtToken,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error("Google Login Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };  


// Unified profile route using User model
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionActive: user.subscriptionStatus === "active",
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile", details: err.message });
  }
};



