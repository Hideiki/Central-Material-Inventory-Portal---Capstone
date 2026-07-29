import { userResource } from "@/data/user"
import { createRouter, createWebHistory } from "vue-router"
import { session } from "./data/session"

const authPages = { hideSidebar: true, public: true }

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/pages/Dashboard.vue')
    },
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/pages/LoginPage.vue'),
		meta: authPages
	},
	{
		path: '/forgot-password',
		name: 'ForgotPassword',
		component: () => import('@/pages/ForgotPassword.vue'),
		meta: authPages
	},
	{
		path: '/register',
		name: 'Register',
		component: () => import('@/pages/Register.vue'),
		meta: authPages
	},
	{
		path: '/inventory',
		name: 'Inventory',
		component: () => import('@/pages/Inventory.vue')
	},
	{
		path: '/stock-in',
		name: 'Stock-In',
		component: () => import('@/pages/StockIn.vue')
	},
	{
		path: '/stock-out',
		name: 'Stock-Out',
		component: () => import('@/pages/StockOut.vue')
	},
	{
		path: '/purchase-requests',
		name: 'PurchaseRequests',
		component: () => import('@/pages/PurchaseRequests.vue')
	},
	{
		path: '/returns',
		name: 'Returns',
		component: () => import('@/pages/Returns.vue')
	},
	{
		path: '/reports',
		name: 'Reports',
		component: () => import('@/pages/Reports.vue')
	},
	{
		path: '/suppliers',
		name: 'Suppliers',
		component: () => import('@/pages/Suppliers.vue')
	},
	{
		path: '/users',
		name: 'Users',
		component: () => import('@/pages/Users.vue')
	},
	{
		path: '/settings',
		name: 'Settings',
		component: () => import('@/pages/Settings.vue')
	}
]

const router = createRouter({
	history: createWebHistory("/warehouse"),
	routes,
})

router.beforeEach((to, from, next) => {
    // Basahin agad ang localStorage (synchronous at mabilis ito)
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

    // I-check ang logic gamit ang local data at yung ginawa mong meta: authPages
    if (!isAuthenticated && !to.meta.public) {
        // Kung hindi logged in at protected ang page, ibato sa login
        next('/login');
    } 
    else if (isAuthenticated && to.name === 'Login') {
        // Kung logged in na tapos pumunta sa login page (e.g. nag-type sa URL), ibalik sa dashboard
        next('/');
    } 
    else {
        // Okay ang lahat, papasukin sa page
        next();
    }
})

export default router
