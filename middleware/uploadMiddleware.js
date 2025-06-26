// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from '../utils/cloudinary.js'; // Ensure this path is correct

// Temp folder to store before uploading to Cloudinary

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'EZCO', // optional: cloud folder name
    allowed_formats: ['jpg', 'png', 'jpeg'], // optional
    transformation: [{ width: 800, height: 600, crop: "limit" }], // optional
  },
});


// File type validation
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! (jpeg, jpg, png)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
upload.array("images", 5)

export default upload;
