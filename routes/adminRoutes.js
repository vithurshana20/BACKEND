// import express from 'express';

// const router = express.Router();

// router.get('/dashboard', (req, res) => {
//   res.send('Admin dashboard');
// });

// export default router;
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { 
  getAllUsers, 
  updateUser, 
  deleteUser 
} from '../controllers/authController.js';

import {
  getAllCourtsForApproval,
  approveCourt,
  rejectCourt
} from '../controllers/courtController.js';

const router = express.Router();

// ✅ User Management (Admin only)
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);

// ✅ Court Approval Routes (Admin only)
router.get('/courts', protect, authorizeRoles('admin'), getAllCourtsForApproval);
router.put('/courts/approve/:id', protect, authorizeRoles('admin'), approveCourt);
router.put('/courts/reject/:id/', protect, authorizeRoles('admin'), rejectCourt);

export default router;

