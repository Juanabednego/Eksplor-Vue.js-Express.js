<template>
  <div class="container mx-auto p-4 text-center">
    <div v-if="loading" class="text-xl text-gray-700">Memuat detail pesanan...</div>
    <div v-else-if="error" class="text-red-600 text-xl">{{ error }}</div>
    <div v-else-if="order">
      <h1 class="text-4xl font-bold text-green-600 mb-4">Pesanan Berhasil Dibuat!</h1>
      <p class="text-lg text-gray-700 mb-6">Terima kasih atas pesanan Anda. Detail pesanan Anda:</p>

      <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-left">
        <div class="mb-4">
          <h2 class="text-2xl font-semibold border-b pb-2 mb-2">Detail Pesanan #{{ order._id }}</h2>
          <p><strong>Tanggal Pesanan:</strong> {{ new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          <p><strong>Status Pembayaran:</strong>
            <span :class="order.isPaid ? 'text-green-600' : 'text-red-600'">
              {{ order.isPaid ? `Sudah Dibayar pada ${new Date(order.paidAt).toLocaleDateString('id-ID')}` : 'Belum Dibayar' }}
            </span>
          </p>
          <p><strong>Status Pengiriman:</strong>
            <span :class="order.isDelivered ? 'text-green-600' : 'text-orange-600'">
              {{ order.isDelivered ? `Sudah Dikirim pada ${new Date(order.deliveredAt).toLocaleDateString('id-ID')}` : 'Belum Dikirim' }}
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
            <p class="font-bold text-lg">Bank ABC - 1234567890 (a.n. PT E-commerce Maju)</p>
            <p class="text-sm text-gray-500">Mohon lakukan pembayaran dalam 24 jam untuk menghindari pembatalan otomatis.</p>
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

      <router-link to="/" class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
        Kembali ke Beranda
      </router-link>
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
        router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
  } finally {
    loading.value = false;
  }
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