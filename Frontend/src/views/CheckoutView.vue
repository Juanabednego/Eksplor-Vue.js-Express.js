<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Selesaikan Pembelian Anda</h1>

      <div class="mb-4">
        <button @click="goBackToCart" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Kembali ke Keranjang
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">1. Informasi Pengiriman</h2>
          <form @submit.prevent="submitOrder">
            <div class="mb-4">
              <label for="address" class="block text-gray-700 text-sm font-bold mb-2">Alamat Lengkap:</label>
              <input type="text" id="address" v-model="shippingAddress.address" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="city" class="block text-gray-700 text-sm font-bold mb-2">Kota:</label>
                <input type="text" id="city" v-model="shippingAddress.city" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              </div>
              <div>
                <label for="postalCode" class="block text-gray-700 text-sm font-bold mb-2">Kode Pos:</label>
                <input type="text" id="postalCode" v-model="shippingAddress.postalCode" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              </div>
            </div>
            <div class="mb-6">
              <label for="country" class="block text-gray-700 text-sm font-bold mb-2">Negara:</label>
              <input type="text" id="country" v-model="shippingAddress.country" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>

            <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">2. Metode Pembayaran</h2>
            <div class="mb-6">
              <label class="inline-flex items-center mb-2">
                <input type="radio" class="form-radio h-5 w-5 text-blue-600" name="paymentMethod" value="Transfer Bank" v-model="paymentMethod" checked>
                <span class="ml-2 text-gray-700">Transfer Bank</span>
              </label>
              <label class="inline-flex items-center ml-6">
                <input type="radio" class="form-radio h-5 w-5 text-gray-400" name="paymentMethod" value="Kartu Kredit/Debit" v-model="paymentMethod" disabled>
                <span class="ml-2 text-gray-500">Kartu Kredit/Debit (Segera Hadir)</span>
              </label>

              <div v-if="paymentMethod === 'Transfer Bank'" class="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mt-4 rounded">
                  <p class="font-bold text-lg mb-2">Informasi Rekening Bank Tujuan:</p>
                  <p class="text-sm">Mohon transfer total pembayaran ke rekening di bawah ini:</p>
                  <div class="mt-2 p-3 bg-white rounded-md border border-blue-200">
                      <p class="mb-1"><strong>Bank:</strong> {{ bankDetails.bankName }}</p>
                      <p class="mb-1"><strong>Nomor Rekening:</strong> <span class="font-mono text-xl font-bold select-all">{{ bankDetails.accountNumber }}</span></p>
                      <p><strong>Atas Nama:</strong> {{ bankDetails.accountName }}</p>
                  </div>
                  <p class="mt-3 text-sm font-semibold">Setelah transfer, segera unggah bukti transfer Anda.</p>
              </div>

              <div v-if="paymentMethod === 'Transfer Bank'" class="mt-6">
                  <label for="proofOfTransfer" class="block text-gray-700 text-sm font-bold mb-2">Unggah Bukti Transfer (Gambar JPG/PNG/GIF, Maks 5MB):</label>
                  <input
                      type="file"
                      id="proofOfTransfer"
                      @change="handleFileUpload"
                      accept="image/jpeg,image/png,image/gif"
                      class="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                      required
                  >
                  <p v-if="proofOfTransferFile" class="mt-2 text-sm text-gray-600">
                      File terpilih: <span class="font-semibold">{{ proofOfTransferFile.name }}</span> ({{ (proofOfTransferFile.size / 1024 / 1024).toFixed(2) }} MB)
                  </p>
                  <p v-if="fileError" class="text-red-500 text-sm mt-1">{{ fileError }}</p>
              </div>
            </div>

            <div class="flex items-center mb-4">
              <input type="checkbox" id="terms" v-model="agreedToTerms" class="form-checkbox h-5 w-5 text-blue-600" required>
              <label for="terms" class="ml-2 text-gray-700 text-sm">Saya menyetujui <a href="#" class="text-blue-500 hover:underline">Syarat & Ketentuan</a></label>
            </div>

            <button type="submit" :disabled="loading || !agreedToTerms || (paymentMethod === 'Transfer Bank' && !proofOfTransferFile) || cartStore.cartTotalItems === 0"
                    class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ loading ? 'Memproses Pesanan...' : 'Bayar Sekarang' }}
            </button>
            <p v-if="error" class="text-red-500 text-center mt-2">{{ error }}</p>
          </form>
        </div>

        <div class="lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>
          <div class="mb-4 border-b pb-4">
            <div v-for="item in cartStore.items" :key="item.product._id" class="flex justify-between items-center mb-2">
              <span>{{ item.product.name }} ({{ item.quantity }}x)</span>
              <span>Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="flex justify-between mb-2">
            <span>Subtotal Barang:</span>
            <span class="font-bold">Rp {{ cartStore.cartSubtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Ongkos Kirim:</span>
            <span class="font-bold">Rp {{ shippingPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between mb-4 border-b pb-4">
            <span>Pajak (0%):</span>
            <span class="font-bold">Rp {{ taxPrice.toLocaleString('id-ID') }}</span>
          </div>

          <div class="flex justify-between items-center text-xl font-bold">
            <span>Total Pembayaran:</span>
            <span class="text-blue-600">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import axios from 'axios';

const cartStore = useCartStore();
const router = useRouter();

const shippingAddress = ref({
  address: '',
  city: '',
  postalCode: '',
  country: 'Indonesia',
});
const paymentMethod = ref('Transfer Bank'); // Default ke Transfer Bank
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);
const fileError = ref(null); // Untuk error spesifik pada upload file

const proofOfTransferFile = ref(null); // Ref untuk menyimpan objek File bukti transfer

// Detail rekening bank tujuan (INI ADALAH DATA RIIL, SILAKAN GANTI DENGAN REKENING ASLI ANDA)
const bankDetails = ref({
    bankName: 'Bank Mandiri',
    accountNumber: '1234567890123', // Contoh nomor rekening bank mandiri
    accountName: 'PT. Pipa Distribusi Utama', // Contoh nama pemilik rekening
});

const shippingPrice = ref(10000); // Contoh: ongkir tetap Rp 10.000
const taxPrice = ref(0); // Contoh: pajak 0%

const itemsPrice = computed(() => cartStore.cartSubtotal);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

const userInfo = ref(null);

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  } else {
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
  }

  // Muat ulang keranjang dan hitung ongkir saat komponen dimuat
  cartStore.loadCartFromLocalStorage();
  // cartStore.calculateShippingCost(); // Jika Anda memiliki logika ongkir dinamis di store
  // shippingPrice.value = cartStore.shippingCost; // Pastikan ongkir disinkronkan dari store
});

const goBackToCart = () => {
  router.push('/cart');
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  fileError.value = null; // Reset error file sebelumnya

  if (file) {
    // Validasi tipe file dan ukuran
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSizeMB = 5; // Maksimal 5MB

    if (!allowedTypes.includes(file.type)) {
      proofOfTransferFile.value = null;
      fileError.value = 'Hanya file gambar (JPG, PNG, GIF) yang diizinkan.';
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      proofOfTransferFile.value = null;
      fileError.value = `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`;
      return;
    }

    proofOfTransferFile.value = file;
  } else {
    proofOfTransferFile.value = null;
    fileError.value = 'Mohon pilih file bukti transfer.';
  }
};

const submitOrder = async () => {
  // --- Validasi Frontend Awal ---
  if (!agreedToTerms.value) {
    error.value = 'Anda harus menyetujui Syarat & Ketentuan.';
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = 'Keranjang belanja Anda kosong. Tambahkan item sebelum checkout.';
    return;
  }

  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login atau sesi Anda telah berakhir. Harap login kembali.';
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  if (paymentMethod.value === 'Transfer Bank' && !proofOfTransferFile.value) {
      error.value = 'Mohon unggah bukti transfer untuk melanjutkan pembayaran.';
      return;
  }
  if (fileError.value) { // Jika ada error dari handleFileUpload, hentikan submit
    error.value = fileError.value;
    return;
  }


  loading.value = true;
  error.value = null; // Reset error umum

  try {
    // Buat objek FormData untuk mengirim data teks dan file
    const formData = new FormData();
    formData.append('shippingAddress', JSON.stringify(shippingAddress.value)); // Objek perlu di-stringify
    formData.append('paymentMethod', paymentMethod.value);
    formData.append('itemsPrice', itemsPrice.value);
    formData.append('shippingPrice', shippingPrice.value);
    formData.append('taxPrice', taxPrice.value);
    formData.append('totalPrice', totalPrice.value);

    // Siapkan orderItems untuk backend (hanya data yang diperlukan)
    const orderItemsForBackend = cartStore.items.map(item => ({
      product: item.product._id, // Hanya kirim ID produk
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.imageUrl || 'https://via.placeholder.com/150', // Pastikan URL gambar produk ada
    }));
    formData.append('orderItems', JSON.stringify(orderItemsForBackend)); // Array of objects perlu di-stringify

    // Tambahkan file bukti transfer jika ada
    if (proofOfTransferFile.value) {
      formData.append('proofOfTransfer', proofOfTransferFile.value); // File akan di-append langsung
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data', // PENTING: Untuk FormData
        Authorization: `Bearer ${userInfo.value.token}`,
      },
    };

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/orders`,
      formData, // Kirim objek FormData
      config
    );

    // Jika pesanan berhasil dibuat
    cartStore.clearCart(); // Kosongkan keranjang
    alert('Pesanan Anda berhasil dibuat! Mohon tunggu konfirmasi pembayaran dari admin.');
    router.push({ name: 'orderConfirmation', params: { orderId: data._id } }); // Arahkan ke halaman konfirmasi
  } catch (err) {
    console.error('Error creating order:', err);
    error.value = err.response && err.response.data.message
      ? err.response.data.message
      : err.message;

    if (err.response && err.response.status === 401) {
        alert('Sesi Anda telah berakhir. Harap login kembali.');
        localStorage.removeItem('userInfo');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Anda bisa menambahkan gaya kustom di sini */
/* Contoh untuk menyembunyikan panah input number jika Anda memiliki */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type="number"] {
    -moz-appearance: textfield;
}
</style>