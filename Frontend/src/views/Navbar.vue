<template>
  <!-- Hanya tampilkan navbar jika sudah login -->
  <nav v-if="isLoggedIn" class="bg-gray-800 text-white p-4 shadow-md">
    <div class="container mx-auto flex items-center justify-between">
      <!-- Logo & Brand -->
      <div class="text-2xl font-semibold">
        <router-link to="/" class="text-white hover:text-gray-300">Dashboard</router-link>
      </div>

      <!-- Desktop Navbar Items -->
      <div class="hidden md:flex space-x-6">
        <!-- Admin navbar links -->
        <template v-if="role === 'admin'">
          <router-link to="/dashboard" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Dashboard</router-link>
          <router-link to="/kelola-pipa" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Kelola Pipa</router-link>
        </template>

        <!-- Customer navbar links -->
        <template v-if="role === 'customer'">
          <router-link to="/home" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Produk Pipa</router-link>
          <!-- Ikon Keranjang untuk Desktop -->
          <router-link to="/cart" class="relative hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center">
            <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Keranjang
            <span v-if="cartStore.cartTotalItems > 0" class="ml-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartStore.cartTotalItems }}
            </span>
          </router-link>
        </template>
      </div>

      <!-- Logout Button (Desktop) -->
      <button @click="logout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg hidden md:block">
        Logout
      </button>

      <!-- Mobile Navbar Items (Hamburger Menu Toggle) -->
      <div class="md:hidden flex items-center">
        <button @click="toggleMenu" class="text-white">
          <i class="fas fa-bars"></i> <!-- Pastikan Anda memiliki Font Awesome atau ikon serupa -->
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden flex flex-col mt-4 space-y-2">
      <template v-if="role === 'admin'">
        <router-link to="/dashboard" class="hover:bg-gray-700 px-4 py-2 rounded-lg" @click="toggleMenu">Dashboard</router-link>
        <router-link to="/kelola-pipa" class="hover:bg-gray-700 px-4 py-2 rounded-lg" @click="toggleMenu">Kelola Pipa</router-link>
      </template>
      <template v-if="role === 'customer'">
        <router-link to="/home" class="hover:bg-gray-700 px-4 py-2 rounded-lg" @click="toggleMenu">Produk Pipa</router-link>
        <!-- Ikon Keranjang untuk Mobile -->
        <router-link to="/cart" class="relative hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center" @click="toggleMenu">
          <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Keranjang
          <span v-if="cartStore.cartTotalItems > 0" class="ml-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartStore.cartTotalItems }}
          </span>
        </router-link>
      </template>
      <router-link to="/about" class="hover:bg-gray-700 px-4 py-2 rounded-lg" @click="toggleMenu">About</router-link>

      <!-- Logout Button (Mobile) -->
      <button @click="logout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-4">
        Logout
      </button>
    </div>
  </nav>

 
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'; // Import onMounted
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart'; // Import cart store

// Reactive state untuk login dan role
const isLoggedIn = computed(() => localStorage.getItem('isLoggedIn') === 'true');
const role = computed(() => localStorage.getItem('role'));
const router = useRouter();
const cartStore = useCartStore(); // Inisialisasi cart store

// Menangani aksi logout dengan refresh paksa
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
  localStorage.setItem('logout', true); // Simpan status logout

  // Refresh paksa untuk memperbarui tampilan setelah logout
  window.location.reload();
}

// Menangani menu di mobile
const isMenuOpen = ref(false);
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

// Lifecycle hook untuk memuat keranjang saat komponen dimount
onMounted(() => {
  // Hanya muat keranjang jika user sudah login
  if (isLoggedIn.value) {
    cartStore.loadCartFromLocalStorage();
  }
});

// Catatan: handleLogin() yang sebelumnya ada di sini sepertinya tidak relevan
// untuk komponen navbar, karena login biasanya ditangani di halaman login itu sendiri.
// function handleLogin() {
//   localStorage.setItem('isLoggedIn', 'true');
//   localStorage.setItem('role', 'customer');
//   window.location.reload();
// }
</script>

<style scoped>
/* Additional styles if necessary */
/* Contoh untuk memastikan link router-link terlihat seperti tombol */
.router-link-active {
  /* Gaya untuk link aktif */
  font-weight: bold;
  color: #3b82f6; /* Warna biru untuk aktif */
}

/* Menyesuaikan jarak antara ikon dan teks jika diperlukan */
.flex.items-center .router-link-active svg,
.flex.items-center .router-link-active span {
  /* Contoh: sedikit penyesuaian */
}
</style>