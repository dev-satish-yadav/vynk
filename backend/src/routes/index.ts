import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

import crypto from 'crypto';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions whitelist
const ALLOWED_MIME_TYPES = new Set([
  // Images (SVG explicitly excluded to prevent Stored XSS)
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Audio
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.mp3',
  '.ogg',
  '.wav',
  '.mp4',
  '.mov',
]);

// Secure Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeUniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeUniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File extension '${ext}' is not permitted. Only images, audio, video, and documents are allowed.`));
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return cb(new Error(`File MIME type '${file.mimetype}' is not permitted.`));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1,
  },
});

// Secure File upload endpoint with custom error handling
router.post(
  '/upload',
  authenticateToken as any,
  (req: Request, res: Response) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File exceeds maximum size limit of 25MB.' });
          }
          return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ success: false, message: err.message || 'Invalid file upload.' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided.' });
      }

      // Sanitize original filename to strip any path traversal characters
      const sanitizedFileName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._\- ]/g, '_');
      const fileUrl = `/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        data: {
          fileName: sanitizedFileName,
          fileUrl,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
      });
    });
  }
);

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

export default router;
