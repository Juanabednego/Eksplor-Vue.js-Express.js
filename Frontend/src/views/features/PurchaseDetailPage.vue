<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center mb-6">
      <button
        @click="router.back()"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200 mr-4"
      >
        &larr; Kembali
      </button>
      <h2 class="text-3xl font-bold text-gray-800">Detail Pembelian (ID: {{ purchaseId }})</h2>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">Memuat detail pembelian...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
    </div>

    <div v-else-if="purchase" class="bg-white shadow-md rounded-lg p-6">
      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Informasi Pembelian</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-gray-600 text-sm">ID Pembelian:</p>
          <p class="text-gray-900 font-medium">{{ purchase.id }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Tanggal Pembelian:</p>
          <p class="text-gray-900 font-medium">{{ formatDate(purchase.createdAt) }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Status:</p>
          <p class="text-gray-900 font-medium">
            <span :class="getStatusBadgeClass(purchase.status)">{{ purchase.status }}</span>
          </p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Jumlah Total:</p>
          <p class="text-green-600 font-bold text-xl">{{ formatCurrency(purchase.totalAmount) }}</p>
        </div>
      </div>

      <hr class="my-6 border-gray-200" />

      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Informasi Pembeli</h3>
      <div v-if="purchase.user" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-gray-600 text-sm">Nama Pembeli:</p>
          <p class="text-gray-900 font-medium">{{ purchase.user.name }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Email Pembeli:</p>
          <p class="text-gray-900 font-medium">{{ purchase.user.email }}</p>
        </div>
        </div>
      <p v-else class="text-gray-500">Informasi pembeli tidak tersedia.</p>

      <hr class="my-6 border-gray-200" />

      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Item-item Pembelian</h3>
      <div v-if="purchase.items && purchase.items.length > 0" class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Nama Produk</th>
              <th class="py-3 px-6 text-center">Kuantitas</th>
              <th class="py-3 px-6 text-right">Harga Satuan</th>
              <th class="py-3 px-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 text-sm">
            <tr v-for="item in purchase.items" :key="item.id" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">{{ item.product ? item.product.name : 'N/A' }}</td>
              <td class="py-3 px-6 text-center">{{ item.quantity }}</td>
              <td class="py-3 px-6 text-right">{{ formatCurrency(item.price) }}</td>
              <td class="py-3 px-6 text-right">{{ formatCurrency(item.quantity * item.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500">Tidak ada item dalam pembelian ini.</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg p-6 text-center text-red-600">
      <p class="text-lg">Gagal memuat detail pembelian atau pembelian tidak ditemukan.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../../url/index.js'; // Sesuaikan path jika berbeda

const route = useRoute();
const router = useRouter();

const purchaseId = ref(route.params.id);
const purchase = ref(null);
const loading = ref(true);

const fetchPurchaseDetails = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
    if (!token) {
      alert('Tidak ada token autentikasi. Silakan login kembali.');
      router.push({ name: 'Login' });
      return;
    }

    const response = await axios.get(`http://${BE_PRE_URL}/purchases/${purchaseId.value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    purchase.value = response.data;
    alert('Detail pembelian berhasil dimuat.');
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    alert('Gagal memuat detail pembelian: ' + (error.response?.data?.message || error.message));
    purchase.value = null;
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const getStatusBadgeClass = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-200 text-yellow-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'completed':
      return 'bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'cancelled':
      return 'bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs font-semibold';
    default:
      return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  }
};

onMounted(() => {
  if (purchaseId.value) {
    fetchPurchaseDetails();
  } else {
    loading.value = false;
    alert('ID Pembelian tidak ditemukan.');
  }
});
</script>

<style scoped>
/* Anda bisa menambahkan styling tambahan di sini, atau mengandalkan Tailwind */
</style>