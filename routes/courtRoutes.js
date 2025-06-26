import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
 // Make sure multer config is correct
import {
  addCourt,
  getAllCourts,
  getMyCourts,
  addAvailableTime,
  uploadCourtImage,
  getAllCourtsForApproval,
  approveCourt,
  rejectCourt,
} from "../controllers/courtController.js";
import { checkSubscription } from "../middleware/checkSubscription.js";

const router = express.Router();

router.post(
  "/add",
  protect,
  authorizeRoles("court_owner"),
checkSubscription,
  upload.array("images", 5),
  addCourt
);


router.get("/", getAllCourts);

router.get(
  "/my-courts",
  protect,
  authorizeRoles("court_owner"),
  getMyCourts
);


router.post(
  "/add-available-time",
  protect,
  authorizeRoles("court_owner"),
  addAvailableTime
);


router.post(
  "/upload-image",
  protect,
  authorizeRoles("court_owner"),
  upload.single("image"),
  uploadCourtImage
);


// Get all courts for approval
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllCourtsForApproval
);

// Approve a court
router.put(
  "/admin/approve/:id",
  protect,
  authorizeRoles("admin"),
  approveCourt
);

// Reject a court
router.put(
  "/admin/reject/:id",
  protect,
  authorizeRoles("admin"),
  rejectCourt
);

export default router;
