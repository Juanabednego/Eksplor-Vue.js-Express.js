import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  updateOrderToDelivered,
  getAllOrders,
} from '../controllers/orderController.js';
// ***PERUBAHAN: Import adminMiddleware***
import { protectedMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF) atau PDF yang diizinkan!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.route('/')
  .post(protectedMiddleware, upload.single('proofOfTransfer'), addOrderItems);


router.route('/myorders').get(protectedMiddleware, getMyOrders);

// ***PERUBAHAN: Menggunakan adminMiddleware***
router.route('/')
  .get(protectedMiddleware, adminMiddleware, getAllOrders);

router.route('/:id')
  .get(protectedMiddleware, getOrderById)
  // ***PERUBAHAN: Menggunakan adminMiddleware***
  .put(protectedMiddleware, adminMiddleware, updateOrderToPaid);

// ***PERUBAHAN: Menggunakan adminMiddleware***
router.route('/:id/deliver')
  .put(protectedMiddleware, adminMiddleware, updateOrderToDelivered);


export default router;