<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Kelola Pipa</h1>
        <p class="text-gray-600">Manajemen data pipa untuk sistem distribusi</p>
      </div>

      <!-- Loading Indicator -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="flex flex-col items-center">
          <div class="loader mb-4"></div>
          <p class="text-gray-600">Memuat data pipa...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <p class="text-red-800 font-medium">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center">
          <span class="text-sm text-gray-700">
            Total: <span class="font-medium">{{ pipes.length }}</span> pipa
          </span>
        </div>
        <div class="flex gap-3">
          <button 
            @click="fetchPipes"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
          <router-link to="/tambah-pipa">
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Tambah Pipa
            </button>
          </router-link>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div v-if="!loading && !error" class="hidden lg:block">
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pipa
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spesifikasi
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga & Stok
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="pipe in pipes" :key="pipe._id" class="hover:bg-gray-50">
                  <!-- Pipa Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-16 w-16">
                        <img v-if="pipe.imageUrl" 
                             :src="pipe.imageUrl" 
                             :alt="pipe.pipeName"
                             class="h-16 w-16 rounded-lg object-cover border border-gray-200">
                        <div v-else class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ pipe.pipeName }}</div>
                        <div class="text-sm text-gray-500">{{ pipe.pipeType }}</div>
                        <div class="text-xs text-gray-400">{{ pipe.pipeClass }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Spesifikasi -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <div class="mb-1">Ø {{ pipe.diameter }}mm</div>
                      <div class="text-gray-500">{{ pipe.length }}m × {{ pipe.wallThickness }}mm</div>
                      <div class="text-xs text-gray-400">{{ pipe.material }}</div>
                    </div>
                  </td>

                  <!-- Harga & Stok -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-medium">
                      Rp {{ pipe.pricePerMeter.toLocaleString('id-ID') }}
                    </div>
                    <div class="text-sm text-gray-500">per meter</div>
                    <div class="text-xs text-gray-400">Stok: {{ pipe.stock }}</div>
                  </td>

                  <!-- Detail -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      <div class="mb-1">Warna: {{ pipe.color }}</div>
                      <div class="text-xs text-gray-500">{{ formatDate(pipe.productionDate) }}</div>
                    </div>
                    <div v-if="pipe.description" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      {{ pipe.description }}
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(pipe.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ pipe.status }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center gap-2">
                      <router-link :to="`/update-pipa/${pipe._id}`">
                        <button class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </router-link>
                      <button @click="deletePipe(pipe._id)" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div v-if="!loading && !error" class="lg:hidden">
        <div class="space-y-4">
          <div v-for="pipe in pipes" :key="pipe._id" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <!-- Header dengan gambar dan nama -->
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-shrink-0">
                <img v-if="pipe.imageUrl" 
                     :src="pipe.imageUrl" 
                     :alt="pipe.pipeName"
                     class="h-16 w-16 rounded-lg object-cover border border-gray-200">
                <div v-else class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ pipe.pipeName }}</h3>
                <p class="text-sm text-gray-500">{{ pipe.pipeType }} • {{ pipe.pipeClass }}</p>
                <span :class="getStatusClass(pipe.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1">
                  {{ pipe.status }}
                </span>
              </div>
            </div>

            <!-- Spesifikasi Grid -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Diameter</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.diameter }}mm</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Panjang</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.length }}m</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ketebalan</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.wallThickness }}mm</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Material</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.material }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Warna</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.color }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.stock }}</dd>
              </div>
            </div>

            <!-- Harga -->
            <div class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Harga per Meter</dt>
              <dd class="text-lg font-bold text-gray-900">Rp {{ pipe.pricePerMeter.toLocaleString('id-ID') }}</dd>
            </div>

            <!-- Deskripsi -->
            <div v-if="pipe.description" class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</dt>
              <dd class="text-sm text-gray-700 mt-1">{{ pipe.description }}</dd>
            </div>

            <!-- Tanggal Produksi -->
            <div class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Produksi</dt>
              <dd class="text-sm text-gray-700">{{ formatDate(pipe.productionDate) }}</dd>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <router-link :to="`/update-pipa/${pipe._id}`" class="flex-1">
                <button class="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit
                </button>
              </router-link>
              <button @click="deletePipe(pipe._id)" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && pipes.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data pipa</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pipa pertama Anda.</p>
        <div class="mt-6">
          <router-link to="/tambah-pipa">
            <button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Tambah Pipa
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BE_PRE_URL from '../../url'

const loading = ref(true)
const error = ref(null)
const pipes = ref([])

// Fetch Pipa Data
const fetchPipes = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get(`http://${BE_PRE_URL}/pipa`)
    pipes.value = response.data.data || response.data || []
  } catch (err) {
    error.value = "Gagal memuat data pipa. Silakan coba lagi nanti."
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

// Delete Pipa dengan konfirmasi yang lebih baik
const deletePipe = async (id) => {
  const pipe = pipes.value.find(p => p._id === id)
  const pipeName = pipe ? pipe.pipeName : 'pipa ini'
  
  if (confirm(`Apakah Anda yakin ingin menghapus "${pipeName}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
    try {
      await axios.delete(`http://${BE_PRE_URL}/pipa/${id}`)
      // Refresh list pipa
      pipes.value = pipes.value.filter(pipe => pipe._id !== id)
      
      // Show success message (optional)
      // You can implement a toast notification here
    } catch (err) {
      alert("Gagal menghapus pipa. Silakan coba lagi.")
      console.error('Delete error:', err)
    }
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get status class for styling
const getStatusClass = (status) => {
  switch (status) {
    case 'Aktif':
      return 'bg-green-100 text-green-800'
    case 'Tidak Aktif':
      return 'bg-red-100 text-red-800'
    case 'Habis Stok':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Ambil data pipa ketika komponen dimuat
onMounted(() => {
  fetchPipes()
})
</script>

<style scoped>
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>