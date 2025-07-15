import express from 'express'; // Ganti require('express')
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
} from '../controllers/orderController.js'; // Pastikan .js di akhir jika file controller juga ES Modules
import { protectedMiddleware } from '../middleware/authMiddleware.js';  // Pastikan ini sudah ada

// POST untuk membuat pesanan baru
router.route('/').post(protectedMiddleware, addOrderItems);
// GET untuk mendapatkan semua pesanan user yang login
router.route('/myorders').get(protectedMiddleware, getMyOrders);

// GET untuk mendapatkan detail pesanan berdasarkan ID
// PUT untuk memperbarui status pembayaran pesanan
router.route('/:id')
  .get(protectedMiddleware, getOrderById)
  .put(protectedMiddleware, updateOrderToPaid); // Biasanya hanya admin atau webhook PG yang mengubah ini

export default router;  