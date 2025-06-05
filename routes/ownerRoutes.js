import express from 'express';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.send('Owner dashboard');
});

export default router;