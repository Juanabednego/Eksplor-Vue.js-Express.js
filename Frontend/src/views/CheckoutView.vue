<template>
  <div v-if="isCheckingLogin" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600 text-lg">Memuat halaman checkout...</p>
  </div>

  <div v-else class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Selesaikan Pembelian Anda</h1>

      <div class="mb-4">
        <button @click="goBackToCart" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          ← Kembali ke Keranjang
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            <div class="mb-4 mt-6">
              <h2 class="text-2xl font-semibold mb-4">2. Metode Pembayaran</h2>
              <label class="block mb-1">Pilih Metode Pembayaran</label>
              <select v-model="paymentMethod" class="w-full border p-2 rounded" required>
                <option disabled value="">-- Pilih Metode Pembayaran --</option>
                <option value="Transfer Bank">Transfer Bank (BCA)</option>
                <option value="Dana">Dana</option>
                <option value="OVO">OVO</option>
              </select>
            </div>

            <div v-if="paymentMethod" class="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
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

            <div class="mt-4" v-if="paymentMethod === 'Transfer Bank' || paymentMethod === 'Dana' || paymentMethod === 'OVO'">
              <label>Bukti Transfer / Pembayaran (JPG/PNG/GIF, maks 5MB)</label>
              <input
                type="file"
                @change="handleFileUpload"
                accept="image/*"
                :required="requiresProof"
                class="block mt-1"
              />
              <p v-if="proofOfTransferFile" class="text-sm mt-1">File: {{ proofOfTransferFile.name }}</p>
              <p v-if="fileError" class="text-red-500">{{ fileError }}</p>
            </div>

            <div class="mt-4">
              <input type="checkbox" v-model="agreedToTerms" required class="mr-2" />
              <label>Saya menyetujui syarat & ketentuan</label>
            </div>

            <button type="submit" class="mt-4 w-full bg-blue-600 text-white p-3 rounded"
              :disabled="!agreedToTerms || (requiresProof && !proofOfTransferFile) || loading">
              {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>

            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div v-for="item in cartStore.items" :key="item.product._id" class="flex justify-between mb-2">
            <span>{{ item.product.name }} x{{ item.quantity }}</span>
            <span>Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}</span>
          </div>
          <hr class="my-2" />
          <div class="flex justify-between">
            <span>Subtotal Barang</span>
            <span>Rp {{ cartStore.cartSubtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Pajak ({{ (taxRate * 100) }}%)</span>
            <span>Rp {{ taxPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Ongkir</span>
            <span>Rp {{ shippingPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
            <span>Total Pembayaran</span>
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
import BE_PRE_URL from '../url/index.js';

const router = useRouter();
const cartStore = useCartStore();

const shippingAddress = ref({ address: '', city: '', postalCode: '', country: 'Indonesia' });
const paymentMethod = ref('Transfer Bank'); // Default value
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);
const fileError = ref(null);
const proofOfTransferFile = ref(null);

const shippingPrice = ref(10000); // Contoh biaya ongkir
const taxRate = ref(0.10); // Pajak 10%

const isCheckingLogin = ref(true);
const userInfo = ref(null);

// Computed properties for price calculations
const itemsPrice = computed(() => cartStore.cartSubtotal);
const taxPrice = computed(() => itemsPrice.value * taxRate.value);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

const requiresProof = computed(() => {
  const methodsRequiringProof = ['Transfer Bank', 'Dana', 'OVO'];
  return methodsRequiringProof.includes(paymentMethod.value);
});

const goBackToCart = () => router.push('/cart');

// Helper: Ambil user dan token dari localStorage
function getUserFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  if (!user || !token) return null;

  try {
    const parsed = JSON.parse(user);
    parsed.token = token;
    return parsed;
  } catch {
    return null;
  }
}

onMounted(() => {
  const storedUser = getUserFromLocalStorage();
  if (!storedUser || !storedUser.token) {
    alert('Anda harus login untuk melakukan pembelian.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  userInfo.value = storedUser;

  cartStore.loadCartFromLocalStorage();

  if (cartStore.items.length === 0) {
    alert('Keranjang belanja Anda kosong, silakan tambahkan produk.');
    router.push('/products');
    return;
  }

  isCheckingLogin.value = false;
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  fileError.value = null;

  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024;

  if (file) {
    if (!allowed.includes(file.type)) {
      fileError.value = 'Hanya file gambar (JPG, PNG, GIF) yang diizinkan.';
      proofOfTransferFile.value = null;
    } else if (file.size > maxFileSize) {
      fileError.value = `Ukuran file maksimal 5MB. File Anda ${Math.round(file.size / 1024 / 1024)}MB.`;
      proofOfTransferFile.value = null;
    } else {
      proofOfTransferFile.value = file;
    }
  } else {
    proofOfTransferFile.value = null;
  }
};

const submitOrder = async () => {
  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login atau sesi Anda telah berakhir. Silakan login kembali.';
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  if (!shippingAddress.value.address || !shippingAddress.value.city || !shippingAddress.value.postalCode || !shippingAddress.value.country) {
    error.value = 'Mohon lengkapi semua informasi pengiriman.';
    return;
  }

  if (!paymentMethod.value) {
    error.value = 'Mohon pilih metode pembayaran.';
    return;
  }

  if (requiresProof.value && !proofOfTransferFile.value) {
    error.value = 'Mohon upload bukti pembayaran.';
    return;
  }

  if (!agreedToTerms.value) {
    error.value = 'Anda harus menyetujui syarat & ketentuan.';
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = 'Keranjang belanja Anda kosong.';
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
      image: item.product.image || '',
    }))));

    if (requiresProof.value && proofOfTransferFile.value) {
      formData.append('proofOfTransferImage', proofOfTransferFile.value);
    }

    const { data } = await axios.post(
      `http://${BE_PRE_URL}/orders`,
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
/* Your existing styles */
</style>