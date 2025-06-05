import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// JWT Token generator function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ...existing code...

// Register User Controller
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id);

    res.status(201).json({ 
      message: "Registered successfully",
      token
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Login User Controller
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

    res.json({ 
      message: "Login successfully",
      token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get Current User Controller
export const getCurrentUser = async (req, res) => {
  try {
    // req.user should be set by your auth middleware after verifying the token
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