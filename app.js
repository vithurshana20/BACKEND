import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cors from 'cors';  
dotenv.config();

const app = express();

app.use(express.json());

app.use('/owner', ownerRoutes);
app.use('/player', playerRoutes);
app.use('/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

export default app;
