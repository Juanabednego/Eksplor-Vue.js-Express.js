<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Daftar Pembelian</h2>
      <button
        @click="fetchPurchases"
        :disabled="loading"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        <span v-if="loading">Memuat Ulang...</span>
        <span v-else>Muat Ulang</span>
      </button>
    </div>

    <div class="mb-4">
      <input
        type="text"
        v-model="filter"
        placeholder="Cari Pembelian..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">Memuat data pembelian...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
    </div>

    <div v-else-if="filteredPurchases.length === 0" class="text-center py-8">
      <p class="text-lg text-gray-600">Tidak ada data pembelian yang tersedia.</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">ID Pembelian</th>
            <th class="py-3 px-6 text-left">Pembeli</th>
            <th class="py-3 px-6 text-right">Jumlah Total</th>
            <th class="py-3 px-6 text-center">Status</th>
            <th class="py-3 px-6 text-left">Tanggal Pembelian</th>
            <th class="py-3 px-6 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm">
          <tr v-for="purchase in filteredPurchases" :key="purchase._id" class="border-b border-gray-200 hover:bg-gray-100">
            <td class="py-3 px-6 text-left whitespace-nowrap">{{ purchase._id }}</td>
            <td class="py-3 px-6 text-left">{{ purchase.user ? purchase.user.name : 'N/A' }}</td>
            <td class="py-3 px-6 text-right">{{ formatCurrency(purchase.totalPrice) }}</td>
            <td class="py-3 px-6 text-center">
              <span :class="getStatusBadgeClass(purchase.orderStatus)">{{ purchase.orderStatus }}</span>
            </td>
            <td class="py-3 px-6 text-left">{{ formatDate(purchase.createdAt) }}</td>
            <td class="py-3 px-6 text-center">
              <button
                @click="viewPurchaseDetails(purchase._id)"
                class="text-blue-600 hover:text-blue-900 mr-2"
                title="Lihat Detail"
              >
                Detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../../url/index.js'; // Pastikan path ini benar
const router = useRouter();

const purchases = ref([]);
const loading = ref(false);
const filter = ref('');

const filteredPurchases = computed(() => {
  if (!filter.value) {
    return purchases.value;
  }
  const lowerCaseFilter = filter.value.toLowerCase();
  return purchases.value.filter(
    (purchase) =>
      purchase._id.toLowerCase().includes(lowerCaseFilter) || // Menggunakan _id bukan id
      (purchase.user && purchase.user.name && purchase.user.name.toLowerCase().includes(lowerCaseFilter)) ||
      (purchase.orderStatus && purchase.orderStatus.toLowerCase().includes(lowerCaseFilter)) // Menggunakan orderStatus
  );
});

const fetchPurchases = async () => {
  loading.value = true;
  let token = null;

  // Baca userInfo dari localStorage
  const storedUser = localStorage.getItem('userInfo');
  if (!storedUser) {
    alert('Anda harus login untuk melihat riwayat pembelian.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    loading.value = false;
    return;
  }

  let userInfo;
  try {
    userInfo = JSON.parse(storedUser);
    if (userInfo && userInfo.token) {
      token = userInfo.token;
    } else {
      // Jika userInfo ada tapi tidak valid (misal, tidak ada token)
      console.warn('userInfo ditemukan tapi tidak valid (tidak ada token). Membersihkan localStorage.');
      localStorage.removeItem('userInfo');
      alert('Sesi login Anda telah berakhir. Silakan login kembali.');
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      loading.value = false;
      return;
    }
  } catch (e) {
    console.error("Error parsing userInfo from localStorage:", e);
    localStorage.removeItem('userInfo');
    alert('Terjadi masalah saat memuat info user. Silakan login kembali.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    loading.value = false;
    return;
  }

  if (!token) {
    alert('Token tidak ditemukan. Silakan login kembali.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    loading.value = false;
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Mengirim token JWT
      },
    };
    
    // PENTING: Pilih salah satu endpoint ini berdasarkan peran halaman ini:
    // Jika ManagePurchasesPage ini hanya untuk ADMIN (sesuai router/index.js Anda), gunakan:
    const response = await axios.get(`http://${BE_PRE_URL}/orders`, config);
    // Jika ManagePurchasesPage ini untuk CUSTOMER melihat pesanannya sendiri, gunakan:
    // const response = await axios.get(`http://${BE_PRE_URL}/orders/myorders`, config);


    purchases.value = response.data;
    alert('Data pembelian berhasil dimuat.');
  } catch (error) {
    console.error('Error fetching purchases:', error);
    // Lebih detail penanganan error 401 dan 403
    if (error.response) {
      if (error.response.status === 401) {
        alert('Tidak Diotorisasi: Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
        localStorage.removeItem('userInfo');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      } else if (error.response.status === 403) {
        alert('Tidak Diotorisasi: Anda tidak memiliki izin untuk melihat halaman ini.');
        router.push({ name: 'Forbidden' }); // Redirect ke halaman forbidden
      } else {
        alert('Gagal memuat data pembelian: ' + (error.response.data.message || error.message));
      }
    } else {
      alert('Gagal memuat data pembelian: ' + error.message);
    }
  } finally {
    loading.value = false;
  }
};

const viewPurchaseDetails = (id) => {
  router.push({ name: 'PurchaseDetail', params: { id: id } });
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
    case 'pending payment': // Sesuaikan dengan status backend
      return 'bg-yellow-200 text-yellow-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'processing':
      return 'bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'shipped':
      return 'bg-purple-200 text-purple-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'delivered': // Sesuaikan dengan status backend
      return 'bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'cancelled':
      return 'bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs font-semibold';
    default:
      return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  }
};

onMounted(() => {
  fetchPurchases();
});
</script>

<style scoped>
/* Anda bisa menambahkan styling tambahan di sini, atau mengandalkan Tailwind */
</style>