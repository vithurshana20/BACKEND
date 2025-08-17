import Owner from '../models/Owner.js';

export const isOwner = async (req, res, next) => {
  try {
    // We assume req.user is populated by a preceding 'protect' middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const user = await Owner.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role !== 'court_owner') {
      return res.status(403).json({ error: 'Access denied. You must be a court owner.' });
    }

    // If the user is a court_owner, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error('Authorization Error:', error);
    res.status(500).json({ error: 'An error occurred during authorization.' });
  }
};