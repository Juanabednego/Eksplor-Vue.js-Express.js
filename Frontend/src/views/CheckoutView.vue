<template>
  <div v-if="isCheckingLogin" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600 text-lg">Memuat halaman checkout...</p>
  </div>

  <div v-else class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Selesaikan Pembelian Anda</h1>

      <!-- Tombol Kembali -->
      <div class="mb-4">
        <button @click="goBackToCart" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          ← Kembali ke Keranjang
        </button>
      </div>

      <!-- Konten Utama -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form Pengiriman & Pembayaran -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-4">1. Informasi Pengiriman</h2>
          <form @submit.prevent="submitOrder">
            <div class="mb-4">
              <label class="block mb-1">Alamat Lengkap</label>
              <input v-model="shippingAddress.address" required class="w-full border p-2 rounded" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1">Kota</label>
                <input v-model="shippingAddress.city" required class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block mb-1">Kode Pos</label>
                <input v-model="shippingAddress.postalCode" required class="w-full border p-2 rounded" />
              </div>
            </div>
            <div class="mt-4">
              <label class="block mb-1">Negara</label>
              <input v-model="shippingAddress.country" required class="w-full border p-2 rounded" />
            </div>

          <div class="mb-4">
  <label class="block mb-1">Pilih Metode Pembayaran</label>
  <select v-model="paymentMethod" class="w-full border p-2 rounded">
    <option disabled value="">-- Pilih Metode Pembayaran --</option>
    <option value="Transfer Bank">Transfer Bank (BCA)</option>
    <option value="Dana">Dana</option>
    <option value="OVO">OVO</option>
  </select>
</div>

<!-- Info dinamis -->
<div v-if="paymentMethod" class="bg-blue-50 text-blue-800 p-3 rounded text-sm">
  <template v-if="paymentMethod === 'Transfer Bank'">
    Silakan transfer ke <strong>BCA 123456789</strong>
  </template>
  <template v-else-if="paymentMethod === 'Dana'">
    Kirim pembayaran ke <strong>0812-3456-7890</strong>
  </template>
  <template v-else-if="paymentMethod === 'OVO'">
    Kirim pembayaran ke <strong>0812-9876-5432</strong>
  </template>
</div>



            <!-- Upload Bukti -->
            <div class="mt-4">
              <label>Bukti Transfer (JPG/PNG/GIF, maks 5MB)</label>
              <input type="file" @change="handleFileUpload" accept="image/*" class="block mt-1" required />
              <p v-if="proofOfTransferFile" class="text-sm mt-1">File: {{ proofOfTransferFile.name }}</p>
              <p v-if="fileError" class="text-red-500">{{ fileError }}</p>
            </div>

            <div class="mt-4">
              <input type="checkbox" v-model="agreedToTerms" required />
              <label>Saya menyetujui syarat & ketentuan</label>
            </div>

            <button type="submit" class="mt-4 w-full bg-blue-600 text-white p-3 rounded"
              :disabled="!agreedToTerms || !proofOfTransferFile || loading">
              {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>

            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
          </form>
        </div>

        <!-- Ringkasan -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div v-for="item in cartStore.items" :key="item.product._id" class="flex justify-between mb-2">
            <span>{{ item.product.name }} x{{ item.quantity }}</span>
            <span>Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}</span>
          </div>
          <hr class="my-2" />
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {{ cartStore.cartSubtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Ongkir</span>
            <span>Rp {{ shippingPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const cartStore = useCartStore();

const shippingAddress = ref({ address: '', city: '', postalCode: '', country: 'Indonesia' });
const paymentMethod = ref('Transfer Bank');
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);
const fileError = ref(null);
const proofOfTransferFile = ref(null);
const shippingPrice = ref(10000);
const taxPrice = ref(0);
const isCheckingLogin = ref(true);
const userInfo = ref(null);

const itemsPrice = computed(() => cartStore.cartSubtotal);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

const goBackToCart = () => router.push('/cart');

onMounted(() => {
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    try {
      userInfo.value = JSON.parse(storedUser);
    } catch (e) {
      console.warn('Gagal parsing userInfo:', e);
      localStorage.removeItem('userInfo');
    }
  }
  cartStore.loadCartFromLocalStorage();
  isCheckingLogin.value = false; // Selesai pengecekan
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  fileError.value = null;

  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  if (file && allowed.includes(file.type) && file.size <= 5 * 1024 * 1024) {
    proofOfTransferFile.value = file;
  } else {
    fileError.value = 'File tidak valid atau lebih dari 5MB';
    proofOfTransferFile.value = null;
  }
};

const submitOrder = async () => {
  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login. Silakan login kembali.';
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('shippingAddress', JSON.stringify(shippingAddress.value));
    formData.append('paymentMethod', paymentMethod.value);
    formData.append('itemsPrice', itemsPrice.value);
    formData.append('shippingPrice', shippingPrice.value);
    formData.append('taxPrice', taxPrice.value);
    formData.append('totalPrice', totalPrice.value);
    formData.append('orderItems', JSON.stringify(cartStore.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.imageUrl || '',
    }))));
    formData.append('proofOfTransfer', proofOfTransferFile.value);

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/orders`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.value.token}`
        }
      }
    );

    cartStore.clearCart();
    alert('Pesanan berhasil dibuat!');
    router.push({ name: 'orderConfirmation', params: { orderId: data._id } });
  } catch (err) {
    console.error('Gagal submit pesanan:', err);
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
