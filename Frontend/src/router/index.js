import { createRouter, createWebHistory } from 'vue-router'

// Import Views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from '../views/features/Dashboard.vue'
import UpdateUser from '../views/features/UpdateUser.vue'
import Detail from '../views/Detail.vue'
import Home from '../views/Home.vue'
import CustomerPage from '../views/CustomerPage.vue'  // Halaman untuk customer
import About from '../views/About.vue'
import Forbidden from '../views/Forbidden.vue'
import IndexKelolaPipa from '../views/KelolaPipa/IndexKelolaPipa.vue'
import UpdatePipa from '../views/KelolaPipa/UpdatePipa.vue'
import CreatePipa from '../views/KelolaPipa/CreatePipa.vue'

const routes = [
  // Halaman Login yang akan dialihkan jika sudah login
  {
    path: '/',
    name: 'Login',
    component: Login,
    beforeEnter: (to, from, next) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const role = localStorage.getItem('role')

      // Jika sudah login, arahkan berdasarkan role
      if (isLoggedIn) {
        if (role === 'admin') {
          next('/dashboard') // Admin diarahkan ke dashboard
        } else if (role === 'customer') {
          next('/home') // Customer diarahkan ke home
        }
      } else {
        next() // Jika belum login, tetap ke halaman login
      }
    }
  },
  
  { path: '/register', name: 'Register', component: Register },
  
  // Halaman untuk admin
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/update/:id',
    name: 'UpdateUser',
    component: UpdateUser,
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/kelola-pipa',
    name: 'KelolaPipa',
    component: IndexKelolaPipa, // route untuk kelola pipa
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/update-pipa/:id',
    name: 'UpdatePipa',
    component: UpdatePipa, // route untuk update pipa
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
  path: '/tambah-pipa',
  name: 'tambah-pipa',
  component: CreatePipa,
  meta: {
    requiresAuth: true,
    role: 'admin'
  }
},



  // Halaman untuk customer
  {
    path: '/customer-page',
    name: 'CustomerPage',
    component: CustomerPage,
    meta: { requiresRole: 'customer' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresRole: 'customer' }
  },

  // Halaman umum
  { path: '/about', name: 'About', component: About },
  
  // Forbidden page
  { path: '/forbidden', name: 'Forbidden', component: Forbidden }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const token = localStorage.getItem('jwt')
  const role = localStorage.getItem('role')

  // Jika belum login dan mencoba mengakses halaman yang membutuhkan login
  const protectedRoutes = ['/dashboard', '/update', '/detail', '/customer-page', '/home']
  if (protectedRoutes.some(path => to.path.startsWith(path)) && (!isLoggedIn || !token)) {
    return next('/') // redirect ke login
  }

  // Role-based access control
  if (to.meta.requiresRole) {
    if (to.meta.requiresRole === 'admin' && role !== 'admin') {
      return next('/forbidden') // Redirect ke Forbidden page jika bukan admin
    }

    if (to.meta.requiresRole === 'customer' && role !== 'customer') {
      return next('/forbidden') // Redirect ke Forbidden page jika bukan customer
    }
  }

  next() // Lanjutkan navigasi
})

export default router
