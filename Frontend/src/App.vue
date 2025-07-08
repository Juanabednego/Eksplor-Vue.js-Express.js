<template>
  <div>
  <Navbar />

    <!-- Tampilan Halaman lainnya -->
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Navbar from './views/Navbar.vue';

</script>
