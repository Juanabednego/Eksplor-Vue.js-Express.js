<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto p-4 text-center">
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xl text-gray-700">Memuat detail pesanan...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-2xl mx-auto" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
        <p class="text-sm mt-2">Pastikan Anda sudah login dan pesanan dengan ID ini ada.</p>
      </div>
      <div v-else-if="order">
        <h1 class="text-4xl font-bold text-green-600 mb-4">Pesanan Berhasil Dibuat!</h1>
        <p class="text-lg text-gray-700 mb-6">Terima kasih atas pesanan Anda. Detail pesanan Anda:</p>

        <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-left">
          <div class="mb-4">
            <h2 class="text-2xl font-semibold border-b pb-2 mb-2">Detail Pesanan #{{ order._id }}</h2>
            <p><strong>Tanggal Pesanan:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>Status Pembayaran:</strong>
              <span :class="order.isPaid ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'">
                {{ order.isPaid ? `Sudah Dibayar ${order.paidAt ? 'pada ' + formatDate(order.paidAt, true) : ''}` : 'Belum Dibayar' }}
              </span>
            </p>
            <p><strong>Status Pesanan:</strong>
              <span :class="{'font-semibold': true, 'text-yellow-600': order.orderStatus === 'Pending Payment', 'text-blue-600': order.orderStatus === 'Processing' || order.orderStatus === 'Paid', 'text-purple-600': order.orderStatus === 'Shipped', 'text-green-600': order.orderStatus === 'Completed', 'text-gray-600': order.orderStatus === 'Cancelled'}">
                {{ order.orderStatus }}
              </span>
            </p>
            <p><strong>Status Pengiriman:</strong>
              <span :class="order.isDelivered ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'">
                {{ order.isDelivered ? `Sudah Dikirim ${order.deliveredAt ? 'pada ' + formatDate(order.deliveredAt, true) : ''}` : 'Belum Dikirim' }}
              </span>
            </p>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Alamat Pengiriman</h3>
            <p>{{ order.shippingAddress.address }}</p>
            <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
            <p>{{ order.shippingAddress.country }}</p>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Metode Pembayaran</h3>
            <p>{{ order.paymentMethod }}</p>
            <div v-if="order.paymentMethod === 'Transfer Bank'">
              <p class="mt-2 text-gray-700">Silakan transfer ke rekening:</p>
              <p class="font-bold text-lg">Bank Mandiri - 1234567890123 (a.n. PT. Pipa Distribusi Utama)</p>
              <p class="text-sm text-gray-500">Mohon lakukan pembayaran dalam 24 jam untuk menghindari pembatalan otomatis.</p>
              <div v-if="order.proofOfTransfer" class="mt-4">
                <p class="font-semibold text-gray-800 mb-2">Bukti Transfer:</p>
                <a :href="getImageUrl(order.proofOfTransfer)" target="_blank" class="text-blue-600 hover:underline">
                  <img :src="getImageUrl(order.proofOfTransfer)" alt="Bukti Transfer" class="max-w-xs h-auto rounded-lg shadow-md border border-gray-200 object-cover">
                  <p class="text-sm mt-1">Klik untuk melihat gambar penuh</p>
                </a>
              </div>
              <div v-else class="mt-4 text-gray-600 italic">
                  Belum ada bukti transfer terunggah.
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Item Pesanan</h3>
            <div v-for="item in order.orderItems" :key="item.product" class="flex items-center justify-between py-2 border-b last:border-b-0">
              <div class="flex items-center">
                <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-md mr-4">
                <div>
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-gray-600 text-sm">{{ item.quantity }} x Rp {{ item.price.toLocaleString('id-ID') }}</p>
                </div>
              </div>
              <span class="font-bold">Rp {{ (item.quantity * item.price).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t-2 border-gray-200">
            <div class="flex justify-between items-center text-lg">
              <span>Subtotal Barang:</span>
              <span class="font-bold">Rp {{ order.itemsPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-lg">
              <span>Ongkos Kirim:</span>
              <span class="font-bold">Rp {{ order.shippingPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-lg mb-2">
              <span>Pajak:</span>
              <span class="font-bold">Rp {{ order.taxPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-2xl font-bold text-blue-700">
              <span>Total Pembayaran:</span>
              <span>Rp {{ order.totalPrice.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>

        <router-link to="/home" class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
          Kembali ke Beranda
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId; // Ambil orderId dari parameter URL

const order = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchOrder = async () => {
  loading.value = true;
  error.value = null;
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); // Ambil token user dari localStorage
    if (!userInfo || !userInfo.token) {
        throw new Error('Anda harus login untuk melihat detail pesanan ini.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`, // Kirim token untuk autentikasi
      },
    };
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, config);
    order.value = data;
  } catch (err) {
    error.value = err.response && err.response.data.message
      ? err.response.data.message
      : err.message;
    console.error('Error fetching order:', err);
    // Jika error autentikasi (misal 401), arahkan ke login
    if (err.response && err.response.status === 401) {
        alert('Sesi Anda telah berakhir. Harap login kembali.');
        localStorage.removeItem('userInfo');
        // Gunakan name router untuk redirect, lebih robust
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
    } else if (err.response && err.response.status === 404) {
        error.value = 'Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.';
    }
  } finally {
    loading.value = false;
  }
};

// Helper untuk memformat tanggal
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
  }
  return date.toLocaleDateString('id-ID', options);
};

// Helper untuk membuat URL gambar yang benar
const getImageUrl = (imagePath) => {
  // Asumsi backend melayani folder /uploads/ dari root (misal: http://localhost:5000/uploads/...)
  // import.meta.env.VITE_API_BASE_URL adalah http://localhost:5000/api
  // Kita perlu menghilangkan /api untuk mendapatkan base URL backend
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};


onMounted(() => {
  if (orderId) {
    fetchOrder();
  } else {
    error.value = 'ID Pesanan tidak ditemukan di URL.';
    loading.value = false;
  }
});
</script>

<style scoped>
/* Anda bisa menambahkan gaya kustom di sini */
</style>