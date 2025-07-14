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

          <!-- <router-link to="/update/1" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Update User</router-link> -->
          <!-- <router-link to="/detail/1" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Detail</router-link> -->
        </template>

        <!-- Customer navbar links -->
        <template v-if="role === 'customer'">
          <router-link to="/home" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Produk Pipa</router-link>
          <!-- <router-link to="/customer-page" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Customer Page</router-link> -->
        </template>

        <!-- Common navbar links -->
        <!-- <router-link to="/about" class="hover:bg-gray-700 px-4 py-2 rounded-lg">About</router-link> -->
      </div>

      <!-- Logout Button -->
      <button @click="logout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
        Logout
      </button>
    </div>

    <!-- Mobile Navbar Items (Hamburger Menu) -->
    <div class="md:hidden flex items-center">
      <button @click="toggleMenu" class="text-white">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden flex flex-col mt-4 space-y-2">
      <template v-if="role === 'admin'">
        <router-link to="/dashboard" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Dashboard</router-link>
        <router-link to="/kelola-pipa" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Kelola Pipa</router-link>

        <!-- <router-link to="/update/1" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Update User</router-link>
        <router-link to="/detail/1" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Detail</router-link> -->
      </template>
      <template v-if="role === 'customer'">
        <router-link to="/home" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Home</router-link>
        <router-link to="/customer-page" class="hover:bg-gray-700 px-4 py-2 rounded-lg">Customer Page</router-link>
      </template>
      <router-link to="/about" class="hover:bg-gray-700 px-4 py-2 rounded-lg">About</router-link>

      <!-- Logout Button (Mobile) -->
      <button @click="logout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg mt-4">
        Logout
      </button>
    </div>
  </nav>

  <!-- Tampilan jika belum login -->
  <div v-else>
    <p class="text-center text-white">Please log in to access the app.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Reactive state untuk login dan role
const isLoggedIn = computed(() => localStorage.getItem('isLoggedIn') === 'true')
const role = computed(() => localStorage.getItem('role'))
const router = useRouter()

// Menangani aksi logout dengan refresh paksa
function logout() {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('jwt')
  localStorage.removeItem('role')
  localStorage.setItem('logout', true) // Simpan role

  
  // Refresh paksa untuk memperbarui tampilan setelah logout  
  window.location.reload()
}

// Menangani menu di mobile
const isMenuOpen = ref(false)
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Refresh paksa setelah login
function handleLogin() {
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('role', 'customer') // Misal role customer
  window.location.reload()  // Paksa refresh setelah login
}
</script>

<style scoped>
/* Additional styles if necessary */
</style>
