<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Selesaikan Pembelian Anda</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">1. Informasi Pengiriman</h2>
        <form @submit.prevent="submitOrder">
          <div class="mb-4">
            <label for="address" class="block text-gray-700 text-sm font-bold mb-2">Alamat Lengkap:</label>
            <input type="text" id="address" v-model="shippingAddress.address" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="city" class="block text-gray-700 text-sm font-bold mb-2">Kota:</label>
              <input type="text" id="city" v-model="shippingAddress.city" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
            </div>
            <div>
              <label for="postalCode" class="block text-gray-700 text-sm font-bold mb-2">Kode Pos:</label>
              <input type="text" id="postalCode" v-model="shippingAddress.postalCode" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
            </div>
          </div>
          <div class="mb-6">
            <label for="country" class="block text-gray-700 text-sm font-bold mb-2">Negara:</label>
            <input type="text" id="country" v-model="shippingAddress.country" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
          </div>

          <h2 class="text-2xl font-semibold mb-4 mt-8">2. Metode Pembayaran</h2>
          <div class="mb-6">
            <label class="inline-flex items-center">
              <input type="radio" class="form-radio" name="paymentMethod" value="Transfer Bank" v-model="paymentMethod" checked>
              <span class="ml-2">Transfer Bank</span>
            </label>
            <label class="inline-flex items-center ml-6">
              <input type="radio" class="form-radio" name="paymentMethod" value="Kartu Kredit/Debit" v-model="paymentMethod" disabled>
              <span class="ml-2 text-gray-500">Kartu Kredit/Debit (Segera Hadir)</span>
            </label>
            </div>

          <div class="flex items-center mb-4">
            <input type="checkbox" id="terms" v-model="agreedToTerms" class="form-checkbox h-5 w-5 text-blue-600" required>
            <label for="terms" class="ml-2 text-gray-700 text-sm">Saya menyetujui <a href="#" class="text-blue-500 hover:underline">Syarat & Ketentuan</a></label>
          </div>

          <button type="submit" :disabled="loading" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full text-lg">
            {{ loading ? 'Memproses Pesanan...' : 'Bayar Sekarang' }}
          </button>
          <p v-if="error" class="text-red-500 text-center mt-2">{{ error }}</p>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Ringkasan Pesanan</h2>
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
const paymentMethod = ref('Transfer Bank');
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);

// Ini bisa dihitung dinamis dari API ongkir atau dari backend
const shippingPrice = ref(10000); // Contoh: ongkir tetap Rp 10.000
const taxPrice = ref(0); // Contoh: pajak 0%

// Computed properties untuk kalkulasi total
const itemsPrice = computed(() => cartStore.cartSubtotal);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

// Informasi user dari localStorage (asumsi disimpan setelah login)
const userInfo = ref(null);

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  } else {
    // Jika user tidak login, redirect ke halaman login
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
  }

  // Opsional: Isi alamat pengiriman dari profil user jika ada
  // const storedShippingAddress = localStorage.getItem('shippingAddress');
  // if (storedShippingAddress) {
  //   shippingAddress.value = JSON.parse(storedShippingAddress);
  // }
});

const submitOrder = async () => {
  // --- Validasi Frontend Awal ---
  if (!agreedToTerms.value) {
    error.value = 'Anda harus menyetujui Syarat & Ketentuan.';
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = 'Keranjang belanja Anda kosong. Tidak dapat membuat pesanan.';
    return;
  }

  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login atau sesi Anda telah berakhir. Harap login kembali.';
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  loading.value = true;
  error.value = null; // Reset error

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.value.token}`, // Kirim token user untuk autentikasi
      },
    };

    // Siapkan data orderItems untuk backend
    // Penting: hanya kirim _id produk, bukan seluruh objek produk
    const orderItemsForBackend = cartStore.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image, // URL gambar
    }));

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/orders`,
      {
        orderItems: orderItemsForBackend,
        shippingAddress: shippingAddress.value,
        paymentMethod: paymentMethod.value,
        itemsPrice: itemsPrice.value,
        shippingPrice: shippingPrice.value,
        taxPrice: taxPrice.value,
        totalPrice: totalPrice.value,
      },
      config
    );

    // Jika order berhasil dibuat di backend
    cartStore.clearCart(); // Kosongkan keranjang di frontend
    alert('Pesanan Anda berhasil dibuat!'); // Feedback
    router.push({ name: 'orderConfirmation', params: { orderId: data._id } }); // Arahkan ke halaman konfirmasi
  } catch (err) {
    // Tangani error dari backend (misal: stok tidak cukup, autentikasi gagal)
    error.value = err.response && err.response.data.message
      ? err.response.data.message
      : err.message;
    console.error('Error creating order:', err);

    // Jika error autentikasi, mungkin token expired atau tidak valid
    if (err.response && err.response.status === 401) {
        alert('Sesi Anda telah berakhir. Harap login kembali.');
        localStorage.removeItem('userInfo'); // Hapus info user dari local storage
        router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    }
  } finally {
    loading.value = false;
  }
};
</script>