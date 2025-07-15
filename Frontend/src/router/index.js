// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Import Views (Pastikan semua path ini benar)
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from '../views/features/Dashboard.vue'
import UpdateUser from '../views/features/UpdateUser.vue'
import Detail from '../views/Detail.vue'
import Home from '../views/Home.vue'
import CustomerPage from '../views/CustomerPage.vue'
import About from '../views/About.vue'
import Forbidden from '../views/Forbidden.vue'
import IndexKelolaPipa from '../views/KelolaPipa/IndexKelolaPipa.vue'
import UpdatePipa from '../views/KelolaPipa/UpdatePipa.vue'
import CreatePipa from '../views/KelolaPipa/CreatePipa.vue'
import CartView from '../views/CartView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import OrderConfirmationView from '../views/OrderConfirmationView.vue';
// import NotFoundView from '../views/NotFoundView.vue'; // Opsional: jika Anda punya halaman 404

const routes = [
  // Rute Publik (tidak memerlukan autentikasi)
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { public: true }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { public: true }
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: Forbidden,
    meta: { public: true }
  },

  // Rute Admin (memerlukan autentikasi dan role 'admin')
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/update/:id',
    name: 'UpdateUser',
    component: UpdateUser,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/kelola-pipa',
    name: 'KelolaPipa',
    component: IndexKelolaPipa,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/update-pipa/:id',
    name: 'UpdatePipa',
    component: UpdatePipa,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/tambah-pipa',
    name: 'tambah-pipa',
    component: CreatePipa,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Rute Customer (memerlukan autentikasi dan role 'customer')
  {
    path: '/customer-page',
    name: 'CustomerPage',
    component: CustomerPage,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true, roles: ['customer'] } // Cart butuh customer login (sesuai request Anda)
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true, roles: ['customer'] } // Checkout butuh customer login
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'orderConfirmation',
    component: OrderConfirmationView,
    props: true,
    meta: { requiresAuth: true, roles: ['customer'] }
  },

  // Catch-all 404 (optional, tapi sangat disarankan)
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: NotFoundView
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start();

  let userInfo = null;
  let isLoggedIn = false;
  let userRole = null;

  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      userInfo = JSON.parse(storedUserInfo);
      // Validasi dasar: harus ada token dan role
      if (userInfo && userInfo.token && userInfo.role) {
        isLoggedIn = true;
        userRole = userInfo.role;
      } else {
        // Data userInfo tidak lengkap/valid, anggap tidak login dan bersihkan
        console.warn('Router Guard: userInfo incomplete/invalid in localStorage. Clearing.');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
      }
    }
    // Jika tidak ada storedUserInfo, isLoggedIn sudah false
  } catch (e) {
    console.error('Router Guard: Error parsing userInfo from localStorage:', e);
    // Data rusak, bersihkan localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
  }

  // --- DEBUGGING LOGS (JANGAN DIHAPUS SAAT DEBUGGING) ---
  console.log(`--- Navigation Check: ${from.fullPath} -> ${to.fullPath} ---`);
  console.log(`isLoggedIn: ${isLoggedIn}`);
  console.log(`userRole: ${userRole}`);
  console.log(`to.meta:`, to.meta);
  // --- END DEBUGGING LOGS ---

  // 1. Pengalihan jika user sudah login dan mencoba mengakses rute publik (Login/Register)
  if (to.meta.public && isLoggedIn) {
    NProgress.done();
    let redirectToHome = { name: 'Home' }; // Default ke Home jika role tidak jelas

    if (userRole === 'admin') {
      redirectToHome = { name: 'Dashboard' };
    } else if (userRole === 'customer') {
      redirectToHome = { name: 'Home' };
    }
    console.log(`Guard: Logged-in user trying to access public route. Redirecting to ${redirectToHome.name}.`);
    return next(redirectToHome);
  }

  // 2. Jika rute membutuhkan autentikasi TAPI user belum login atau userInfo tidak valid
  if (to.meta.requiresAuth && !isLoggedIn) {
    NProgress.done();
    console.log(`Guard: Route ${to.name} requires auth, but user is not logged in or session invalid. Redirecting to Login.`);
    // Simpan rute tujuan asli agar bisa redirect kembali setelah login
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 3. Role-based Access Control
  // Jika rute membutuhkan role tertentu (melalui `to.meta.roles`) DAN user sudah login
  if (to.meta.roles && isLoggedIn) {
    if (!to.meta.roles.includes(userRole)) {
      // User tidak memiliki role yang diizinkan
      NProgress.done();
      console.warn(`Guard: Access Denied! User role "${userRole}" is not allowed for route "${to.name}".`);
      alert('Anda tidak memiliki izin untuk mengakses halaman ini.'); // Pop-up untuk user
      // Arahkan kembali ke halaman yang sesuai dengan role user atau ke Forbidden
      if (userRole === 'admin') {
        return next({ name: 'Dashboard' });
      } else if (userRole === 'customer') {
        return next({ name: 'Home' });
      } else {
        // Jika role tidak dikenal atau tidak ada, arahkan ke login atau forbidden
        return next({ name: 'Forbidden' }); // Atau { name: 'Login' }
      }
    }
  }

  // Jika semua pemeriksaan lolos, lanjutkan
  console.log('Guard: Navigation allowed. Proceeding to next().');
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;