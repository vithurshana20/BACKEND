import app from './app.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';


dotenv.config();

connectDB();

const PORT = process.env.PORT;


mongoose.connect(process.env.mongodb_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});