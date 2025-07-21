<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Daftar Pembelian (Orders)</h2>
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
        placeholder="Cari ID Pembelian, Nama Pembeli, Status..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">Memuat data pembelian...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
    </div>

    <div v-else-if="filteredPurchases.length === 0" class="text-center py-8">
      <p class="text-lg text-gray-600">Tidak ada data pembelian yang tersedia atau sesuai filter.</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">ID Pembelian</th>
            <th class="py-3 px-6 text-left">Pembeli</th>
            <th class="py-3 px-6 text-right">Jumlah Total</th>
            <th class="py-3 px-6 text-center">Status Pesanan</th>
            <th class="py-3 px-6 text-center">Status Pembayaran</th>
            <th class="py-3 px-6 text-center">Status Pengiriman</th>
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
            <td class="py-3 px-6 text-center">
              <span :class="purchase.isPaid ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'"
                    class="py-1 px-3 rounded-full text-xs font-semibold">
                {{ purchase.isPaid ? 'Sudah Dibayar' : 'Belum Dibayar' }}
              </span>
            </td>
            <td class="py-3 px-6 text-center">
              <span :class="purchase.isDelivered ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'"
                    class="py-1 px-3 rounded-full text-xs font-semibold">
                {{ purchase.isDelivered ? 'Sudah Dikirim' : 'Belum Dikirim' }}
              </span>
            </td>
            <td class="py-3 px-6 text-left">{{ formatDate(purchase.createdAt) }}</td>
            <td class="py-3 px-6 text-center relative">
              <button
                @click="toggleActions(purchase._id)"
                class="text-blue-600 hover:text-blue-900 mr-2 px-2 py-1 rounded border border-blue-600"
                title="Aksi"
              >
                Aksi <i class="fas fa-caret-down ml-1"></i>
              </button>
              <div v-if="activeActions === purchase._id" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  @click="updateOrderStatus(purchase._id, 'Processing')"
                  v-if="purchase.orderStatus !== 'Processing' && purchase.orderStatus !== 'Completed' && purchase.orderStatus !== 'Cancelled'"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Set ke Processing
                </button>
                 <button
                  @click="updateOrderStatus(purchase._id, 'Shipped')"
                  v-if="purchase.orderStatus === 'Processing' && purchase.orderStatus !== 'Completed' && purchase.orderStatus !== 'Cancelled'"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Set ke Dikirim
                </button>
                 <button
                  @click="updateOrderStatus(purchase._id, 'Completed')"
                  v-if="purchase.orderStatus !== 'Completed' && purchase.orderStatus !== 'Cancelled'"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Set ke Selesai
                </button>
                <button
                  @click="markOrderAsPaid(purchase._id)"
                  v-if="!purchase.isPaid"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Tandai Sudah Dibayar
                </button>
                <button
                  @click="markOrderAsDelivered(purchase._id)"
                  v-if="!purchase.isDelivered && purchase.orderStatus === 'Shipped'"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Tandai Sudah Dikirim
                </button>
                <button
                  @click="updateOrderStatus(purchase._id, 'Cancelled')"
                  v-if="purchase.orderStatus !== 'Cancelled' && purchase.orderStatus !== 'Completed'"
                  class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                >
                  Batalkan Pesanan
                </button>
                <router-link :to="{ name: 'PurchaseDetail', params: { id: purchase._id } }"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200 mt-2 pt-2"
                >
                  Lihat Detail Lengkap
                </router-link>
              </div>
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
const activeActions = ref(null); // State untuk mengontrol dropdown aksi

// Helper function to get user info and token consistently
function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  console.log('[ManagePurchases] Attempting to get user info from localStorage...');
  console.log('  userData found:', !!user);
  console.log('  jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[ManagePurchases] User data or JWT token is missing in localStorage.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token; // Attach the token to the user object
    console.log('[ManagePurchases] Successfully retrieved user info with token.');
    return parsedUser;
  } catch (e) {
    console.error('[ManagePurchases] Error parsing user data from localStorage:', e);
    return null;
  }
}

const filteredPurchases = computed(() => {
  if (!filter.value) {
    return purchases.value;
  }
  const lowerCaseFilter = filter.value.toLowerCase();
  return purchases.value.filter(
    (purchase) =>
      purchase._id.toLowerCase().includes(lowerCaseFilter) ||
      (purchase.user && purchase.user.name && purchase.user.name.toLowerCase().includes(lowerCaseFilter)) ||
      (purchase.orderStatus && purchase.orderStatus.toLowerCase().includes(lowerCaseFilter))
  );
});

// Toggle dropdown aksi
const toggleActions = (purchaseId) => {
  activeActions.value = activeActions.value === purchaseId ? null : purchaseId;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (activeActions.value && !event.target.closest('.relative')) {
    activeActions.value = null;
  }
};

const fetchPurchases = async () => {
  console.log('[ManagePurchases] Fetching purchases...');
  loading.value = true;
  activeActions.value = null; // Close any open dropdowns

  const userInfo = getUserInfoFromLocalStorage(); // Use consistent helper
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login sebagai admin untuk melihat daftar pembelian.');
    localStorage.removeItem('userData'); // Clean up potentially corrupt data
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    loading.value = false;
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`, // Mengirim token JWT
      },
    };
    
    console.log(`[ManagePurchases] Sending GET request to: http://${BE_PRE_URL}/orders`);
    const response = await axios.get(`http://${BE_PRE_URL}/orders`, config);
    
    purchases.value = response.data;
    console.log('[ManagePurchases] Purchases data fetched successfully:', response.data.length, 'items.');
  } catch (error) {
    console.error('Error fetching purchases:', error);
    if (error.response) {
      console.error('[ManagePurchases] Server Response Error:', error.response.data);
      console.error('[ManagePurchases] Status:', error.response.status);
      if (error.response.status === 401) {
        alert('Tidak Diotorisasi: Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      } else if (error.response.status === 403) {
        alert('Tidak Diotorisasi: Anda tidak memiliki izin untuk melihat halaman ini.');
        router.push({ name: 'Home' }); // Redirect to home if not authorized
      } else {
        alert('Gagal memuat data pembelian: ' + (error.response.data.message || error.message));
      }
    } else if (error.request) {
      alert('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } else {
      alert('Terjadi kesalahan tidak terduga: ' + error.message);
    }
  } finally {
    loading.value = false;
    console.log('[ManagePurchases] Fetch process finished.');
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  console.log(`[ManagePurchases] Attempting to update order ${orderId} status to: ${newStatus}`);
  activeActions.value = null; // Close dropdown immediately
  if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ${orderId} menjadi "${newStatus}"?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pesanan.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const body = { orderStatus: newStatus };
    
    console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/status with body:`, body);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/status`, body, config);
    
    alert(`Status pesanan ${orderId} berhasil diubah menjadi "${newStatus}".`);
    fetchPurchases(); // Muat ulang daftar untuk menampilkan perubahan
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.response) {
      console.error('[ManagePurchases] Server Response Error:', error.response.data);
      alert('Gagal mengubah status pesanan: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    } else if (error.request) {
      alert('Tidak dapat terhubung ke server untuk mengubah status.');
    } else {
      alert('Terjadi kesalahan saat mengubah status: ' + error.message);
    }
  }
};

const markOrderAsPaid = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as paid.`);
  activeActions.value = null; // Close dropdown immediately
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ${orderId} sebagai sudah dibayar?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pembayaran.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/pay`);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/pay`, {}, config); // Body kosong atau { isPaid: true }
    
    alert(`Pesanan ${orderId} berhasil ditandai sebagai sudah dibayar.`);
    fetchPurchases(); // Muat ulang daftar untuk menampilkan perubahan
  } catch (error) {
    console.error('Error marking order as paid:', error);
    if (error.response) {
      alert('Gagal menandai pesanan sebagai sudah dibayar: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    } else {
      alert('Terjadi kesalahan saat menandai pembayaran: ' + error.message);
    }
  }
};

const markOrderAsDelivered = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as delivered.`);
  activeActions.value = null; // Close dropdown immediately
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ${orderId} sebagai sudah dikirim?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pengiriman.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/deliver`);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/deliver`, {}, config); // Body kosong atau { isDelivered: true }
    
    alert(`Pesanan ${orderId} berhasil ditandai sebagai sudah dikirim.`);
    fetchPurchases(); // Muat ulang daftar untuk menampilkan perubahan
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    if (error.response) {
      alert('Gagal menandai pesanan sebagai sudah dikirim: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    } else {
      alert('Terjadi kesalahan saat menandai pengiriman: ' + error.message);
    }
  }
};


const viewPurchaseDetails = (id) => {
  activeActions.value = null; // Close dropdown before navigating
  router.push({ name: 'PurchaseDetail', params: { id: id } });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rp ' + (0).toLocaleString('id-ID');
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
  if (!status) return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  switch (status.toLowerCase()) {
    case 'pending payment':
      return 'bg-yellow-200 text-yellow-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'processing':
    case 'paid': // Assume 'paid' is a type of processing status
      return 'bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'shipped':
      return 'bg-purple-200 text-purple-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'completed':
    case 'delivered': // Assume 'delivered' is the final completed status
      return 'bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'cancelled':
      return 'bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs font-semibold';
    default:
      return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  }
};

onMounted(() => {
  fetchPurchases();
  // Add event listener to close dropdown on outside click
  document.addEventListener('click', handleClickOutside);
});

// Cleanup event listener when component is unmounted
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Anda bisa menambahkan styling tambahan di sini, atau mengandalkan Tailwind */
</style>