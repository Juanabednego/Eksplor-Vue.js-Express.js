// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product'); // Untuk validasi stok dan pengurangan
const asyncHandler = require('express-async-handler'); // Untuk error handling async/await

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (hanya user terautentikasi)
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('Tidak ada item dalam pesanan');
  } else {
    // --- Validasi Stok Produk ---
    // Iterasi setiap item di order dan cek stok di database
    for (const item of orderItems) {
      const product = await Product.findById(item.product); // item.product adalah _id dari produk
      if (!product) {
        res.status(404);
        throw new Error(`Produk dengan ID ${item.product} tidak ditemukan.`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Stok untuk produk "${product.name}" tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}`);
      }
    }

    const order = new Order({
      user: req.user._id, // Ambil ID user dari middleware 'protect'
      orderItems: orderItems.map(item => ({
        // Penting: Hanya kirim data yang relevan dan _id produk
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        _id: undefined // Hapus _id yang mungkin dikirim dari frontend untuk item, agar MongoDB generate baru
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // --- Kurangi Stok Produk Setelah Pesanan Dibuat ---
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) { // Periksa lagi untuk keamanan, meskipun sudah divalidasi di awal
        product.stock -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json(createdOrder); // Kirim kembali objek order yang baru dibuat
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email') // Mengambil nama dan email user yang membuat order
    .populate('orderItems.product', 'name image'); // Mengambil nama dan gambar produk dari order items

  if (order) {
    // Verifikasi bahwa user yang meminta adalah pemilik order atau admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Tidak diotorisasi: Anda tidak memiliki akses ke pesanan ini');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Pesanan tidak ditemukan');
  }
});

// @desc    Update order to paid (Setelah konfirmasi pembayaran dari payment gateway/manual)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    // Simpan detail hasil pembayaran dari Payment Gateway jika ada
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Pesanan tidak ditemukan');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Urutkan dari terbaru
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
};