const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product', // Referensi ke model Product
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // URL gambar produk dari saat item ditambahkan
});

const orderSchema = mongoose.Schema(
  {
    user: { // Pengguna yang membuat pesanan
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referensi ke model User
    },
    orderItems: [orderItemSchema], // Array dari item-item yang dipesan
    shippingAddress: { // Detail alamat pengiriman
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { // Metode pembayaran yang dipilih
      type: String,
      required: true,
    },
    paymentResult: { // Detail transaksi dari Payment Gateway (opsional, akan diisi setelah pembayaran)
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { // Subtotal harga barang saja
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: { // Harga pajak (jika ada)
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: { // Harga ongkos kirim
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { // Total keseluruhan yang harus dibayar
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: { // Status pembayaran
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: { // Tanggal pembayaran
      type: Date,
    },
    isDelivered: { // Status pengiriman
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: { // Tanggal pengiriman
      type: Date,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;