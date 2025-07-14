// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware'); // Pastikan ini sudah ada

// POST untuk membuat pesanan baru
router.route('/').post(protect, addOrderItems);

// GET untuk mendapatkan semua pesanan user yang login
router.route('/myorders').get(protect, getMyOrders);

// GET untuk mendapatkan detail pesanan berdasarkan ID
// PUT untuk memperbarui status pembayaran pesanan
router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, updateOrderToPaid); // Biasanya hanya admin atau webhook PG yang mengubah ini

module.exports = router;