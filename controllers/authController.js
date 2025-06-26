import User from '../models/Player.js';
import jwt from 'jsonwebtoken';
// import crypto from "crypto";
// import { sendEmail } from "../utils/sendEmail.js";

// JWT Token generator function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

//  Register User Controller 
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, phone, password, role } = req.body;

//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({ message: "Name, email, phone, and password are required" });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     await User.create({ name, email, phone, password, role ,  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

//     res.status(201).json({
//       message: "Registered successfully."
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const registerPlayer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Player already exists" });
    }

    const player = await User.create({
      name,
      email,
      phone,
      password,
      role: "player",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      return res.status(400).json({ message: "Owner already exists" });
    }

    const owner = await User.create({
      name,
      email,
      phone,
      password,
      role: "court_owner",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    res.json(user);
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

