// backend/controllers/orderController.js
import Order from '../models/Order.js'; // Pastikan path dan ekstensi .js benar untuk model Order Anda
import Pipe from '../models/pipaModel.js'; // <--- PERBAIKAN AKHIR: Import sebagai 'Pipe' sesuai default export

import asyncHandler from 'express-async-handler'; // Menggunakan import untuk express-async-handler

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (hanya user terautentikasi)
export const addOrderItems = asyncHandler(async (req, res) => {
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
    
    for (const item of orderItems) {
     
      const pipeDoc = await Pipe.findById(item.product); 
      if (!pipeDoc) {
        res.status(404);
        throw new Error(`Produk pipa dengan ID ${item.product} tidak ditemukan.`);
      }
     
      if (pipeDoc.stock < item.quantity) { 
        res.status(400);
        throw new Error(`Stok untuk produk "${pipeDoc.pipeName}" tidak mencukupi. Tersedia: ${pipeDoc.stock}, diminta: ${item.quantity}`); // <--- MENGGUNAKAN pipeDoc.pipeName
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map(item => ({
     
        product: item.product, // _id produk dari item.product (ini adalah ID pipa)
        name: item.name, // Nama produk dari item cart (ini adalah pipeName)
        quantity: item.quantity,
        price: item.price, // Harga per unit produk
        image: item.image, // URL gambar produk
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
      // Menggunakan Pipe.findById
      const pipeDoc = await Pipe.findById(item.product); // <--- MENGGUNAKAN Pipe.findById
      if (pipeDoc) {
        pipeDoc.stock -= item.quantity; // <--- MENGGUNAKAN pipeDoc.stock
        await pipeDoc.save();
      }
    }

    res.status(201).json(createdOrder); // Kirim kembali objek order yang baru dibuat
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email') // Mengambil nama dan email user yang membuat order
    .populate('orderItems.product', 'pipeName imageUrl'); // <--- PASTIKAN INI SESUAI DENGAN SCHEMA pipaModel: pipeName, imageUrl

  if (order) {
    // Verifikasi bahwa user yang meminta adalah pemilik order atau admin
    // Asumsi req.user.isAdmin adalah properti boolean yang menandakan role admin
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
export const updateOrderToPaid = asyncHandler(async (req, res) => {
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
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Urutkan dari terbaru
  res.json(orders);
});

// Tidak perlu module.exports lagi karena sudah menggunakan export const