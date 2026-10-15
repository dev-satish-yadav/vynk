import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authRoutes from './authRoutes';
import chatRoutes from './chatRoutes';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// File upload endpoint
router.post('/upload', authenticateToken as any, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    },
  });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

export default router;
