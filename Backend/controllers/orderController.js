// backend/controllers/orderController.js

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Pipe from '../models/pipaModel.js'; // ***PERBAIKAN: Mengacu ke pipaModel.js***
import CartItem from '../models/CartItem.js';
import User from '../models/userModel.js'; // ***Tambahkan ini untuk populate user data***
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';


// @desc    Create new order
// @route   POST /api/orders
// @access  Private (hanya user terautentikasi)
export const addOrderItems = asyncHandler(async (req, res) => {
  console.log('--- addOrderItems: Request Received ---');
  console.log('Req Body (Raw):', req.body);
  console.log('Req File (from Multer):', req.file);
  console.log('User from Auth Middleware (req.user):', req.user ? req.user.nama : 'Not Available (User not authenticated)');

  const {
    orderItems: orderItemsString,
    shippingAddress: shippingAddressString,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  let orderItems;
  let shippingAddress;

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated. Please log in.');
  }

  try {
    orderItems = JSON.parse(orderItemsString);
    shippingAddress = JSON.parse(shippingAddressString);
    console.log('Parsed orderItems:', orderItems);
    console.log('Parsed shippingAddress:', shippingAddress);
  } catch (parseError) {
    console.error('ERROR: Parsing orderItems/shippingAddress failed:', parseError);
    res.status(400);
    throw new Error('Data pesanan atau alamat pengiriman tidak valid (format JSON salah).');
  }

  const proofOfTransferFile = req.file;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Tidak ada item dalam pesanan');
  }

  if (paymentMethod === 'Transfer Bank' && !proofOfTransferFile) {
    res.status(400);
    throw new Error('Bukti transfer diperlukan untuk metode pembayaran Transfer Bank.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  console.log('Transaction session started.');

  let proofOfTransferImageUrl = null;

  try {
    const updatedOrderItems = [];
    for (const item of orderItems) {
      console.log(`Checking stock for product ID: ${item.product} (Requested Quantity: ${item.quantity})`);
      const pipeDoc = await Pipe.findById(item.product).session(session); // Menggunakan model Pipe dari pipaModel.js
      if (!pipeDoc) {
        throw new Error(`Produk pipa dengan ID ${item.product} tidak ditemukan.`);
      }

      if (pipeDoc.stock < item.quantity) {
        throw new Error(`Stok untuk produk "${pipeDoc.pipeName}" tidak mencukupi. Tersedia: ${pipeDoc.stock}, diminta: ${item.quantity}`);
      }

      console.log(`Before stock update for ${pipeDoc.pipeName}: ${pipeDoc.stock}`);
      pipeDoc.stock -= item.quantity;
      await pipeDoc.save({ session });
      console.log(`After stock update for ${pipeDoc.pipeName}: ${pipeDoc.stock}`);

      updatedOrderItems.push({
        product: pipeDoc._id,
        name: pipeDoc.pipeName,
        quantity: item.quantity,
        price: pipeDoc.pricePerMeter, // ***PENTING: Menggunakan pricePerMeter dari pipaModel.js***
        image: pipeDoc.imageUrl,
      });
    }
    console.log('All product stocks verified and updated in session.');

    if (proofOfTransferFile) {
      console.log('Attempting to upload proof of transfer to Cloudinary...');
      try {
        const result = await cloudinary.uploader.upload(proofOfTransferFile.path, {
          folder: 'proof_of_transfers',
          resource_type: 'image',
        });
        proofOfTransferImageUrl = result.secure_url;
        console.log('Cloudinary upload successful. URL:', proofOfTransferImageUrl);
      } catch (uploadError) {
        console.error('ERROR: Cloudinary upload failed:', uploadError);
        if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
            fs.unlink(proofOfTransferFile.path, (err) => {
                if (err) console.error('Error deleting local file after failed Cloudinary upload:', err);
            });
        }
        throw new Error(`mengunggah bukti transfer: ${uploadError.message}`);
      } finally {
        if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
            fs.unlink(proofOfTransferFile.path, (err) => {
                if (err) console.error('Error deleting local file after successful Cloudinary upload:', err);
                else console.log('Local proof of transfer file deleted.');
            });
        }
      }
    }

    console.log('Creating new Order object...');
    const order = new Order({
      user: req.user._id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      proofOfTransferImage: proofOfTransferImageUrl,
      orderStatus: 'Pending Payment',
    });

    const createdOrder = await order.save({ session });
    console.log('Order saved in session. Order ID:', createdOrder._id);

    console.log('Attempting to clear user cart from database...');
    await CartItem.deleteMany({ user: req.user._id }).session(session);
    console.log('User cart cleared in session.');

    await session.commitTransaction();
    console.log('Transaction committed successfully. All changes saved to DB.');

    res.status(201).json(createdOrder);

  } catch (error) {
    await session.abortTransaction();
    console.error('--- ERROR: Transaction aborted due to ---');
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', error);

    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlink(proofOfTransferFile.path, (err) => {
            if (err) console.error('Error deleting local file during transaction abort:', err);
        });
    }

    res.status(400);
    throw new Error(error.message || 'Gagal membuat pesanan: Terjadi kesalahan yang tidak terduga.');
  } finally {
    session.endSession();
    console.log('Transaction session ended.');
    console.log('--- addOrderItems: Request Finished ---');
  }
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'nama email') // ***PENTING: Mengacu properti 'username' di userModel.js***
    .populate('orderItems.product', 'pipeName imageUrl'); // Mengacu properti 'pipeName' di pipaModel.js

  if (order) {
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
// @access  Private (Admin Only - untuk kasus manual, atau Webhook - untuk Payment Gateway)
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.orderStatus = 'Processing';

      if (req.body.id && req.body.status) {
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time || new Date().toISOString(),
          email_address: req.body.email_address || (req.user ? req.user.email : undefined),
        };
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(400);
      throw new Error('Pesanan ini sudah dibayar');
    }
  } else {
    res.status(404);
    throw new Error('Pesanan tidak ditemukan');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'pipeName imageUrl'); // Mengacu properti 'pipeName' di pipaModel.js
  res.json(orders);
});

// @desc    Update order to delivered (Admin Only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.orderStatus = 'Delivered';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});


// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id nama email') // ***PENTING: Mengacu properti 'nama' di userModel.js***
        .sort({ createdAt: -1 });
    res.json(orders);
});