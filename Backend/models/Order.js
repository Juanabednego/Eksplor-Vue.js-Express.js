import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pipe', // Mengacu ke model Pipe Anda
  },
  name: { type: String, required: true }, // Biasanya pipeName dari pipa
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const orderSchema = mongoose.Schema(
  {
    user: { // Pengguna yang membuat pesanan
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referensi ke model User (asumsi nama modelnya 'User')
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
    isPaid: { // Status pembayaran (sudah diverifikasi admin)
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: { // Tanggal pembayaran diverifikasi
      type: Date,
    },
    isDelivered: { // Status pengiriman (sudah dikirim)
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: { // Tanggal pengiriman
      type: Date,
    },
    // --- FIELD BARU YANG DITAMBAHKAN/DIUBAH ---
    orderStatus: { // Status alur pesanan (lebih rinci dari isPaid/isDelivered)
      type: String,
      required: true,
      default: 'Pending Payment', // Status awal saat order dibuat
      enum: ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    },
    proofOfTransferImage: { // URL ke gambar bukti transfer
      type: String,
      required: function() {
        // Field ini hanya wajib jika paymentMethod adalah 'Transfer Bank'
        return this.paymentMethod === 'Transfer Bank';
      },
    },
    adminNotes: { // Catatan internal untuk admin
      type: String,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;