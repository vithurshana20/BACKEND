import express from 'express';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.send('Player dashboard');
});

export default router;