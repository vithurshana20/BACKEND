import dotenv from 'dotenv';
dotenv.config(); //  Load environment variables at the very top
// import { startSubscriptionExpiryCron } from "./utils/cron.js";

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
// import webhookRoutes from "./routes/webhookRoutes.js";

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courtRoutes from './routes/courtRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import webhookRoutes from './routes/webhook.js'; // 🔁 
import bodyParser from 'body-parser';

import './config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ Stripe Webhook - raw parser (must come BEFORE express.json)

//  Basic Middlewares
app.use('/api', webhookRoutes);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(session({
  secret: "secret123", // 🔒 For production, store secret in .env
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//  Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/users', userRoutes);
// app.use("/api/payments", paymentRoutes);
app.use('/api/subscribe', subscriptionRoutes); // ✅ Stripe subscription endpoint


//  Basic Health Check
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

//  Start server after DB connection
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
