import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Third route example (replace with your actual controller function)
router.get('/profile', (req, res) => {
  res.send('User profile route');
});


export default router;
