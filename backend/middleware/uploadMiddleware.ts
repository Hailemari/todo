import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create the upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define the storage engine
interface StorageEngineOptions {
  destination: string;
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => void;
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
} as StorageEngineOptions);

// File filter function to allow only images
const fileFilter = (
  req: Request,
  file: Express.Multer.File, // Explicitly type the file parameter as multer's File
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file.fieldname === 'image') {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.originalname);
    if (!isImage) {
      return cb(null, false); // Prevent file upload by returning false
    }
  }
  cb(null, true); // Allow the file
};

// Configure multer with storage, file filter, and limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Set file size limit to 10MB
});

// Export the uploadFields middleware to handle multiple fields
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 }, // Max one image file
  { name: 'file', maxCount: 1 }, // Max one additional file
]);
