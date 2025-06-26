import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';



import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courtRoutes from './routes/courtRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
// import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use(cors({
  origin:"http://localhost:5173",
  credentials: true, }));
 

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/subscribe', subscriptionRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
