<template>
    <aside class="shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out"
    :class="isOpen ? 'w-72' : 'w-0'">
        <div class="w-72 h-full flex flex-col bg-white border-r border-gray-300">
            <!-- LOGO -->
            <div class="flex items-center gap-3 px-2 py-3">
                <div class="w-20 h-20 rounded-xl flex items-center justify-center shrink-0">
                    <img :src="Logo" alt="Logo" class="w-full h-full object-contain">
                </div>
                <h2 class="font-semibold text-blue-800 text- leading-tight">
                    Centralized Materials Inventory Portal
                </h2>
            </div>
            <!-- NAVCARD -->
            <div class="flex-1 bg-blue-700 mt-2 flex-col text-white overflow-hidden">
                <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <RouterLink v-for="item in navItems" :key="item.name" :to="item.to" class="flex items-center gap-4 px-3 py-2.5
                    rounded-lg transition-colors" :class="isActive(item.to) ? 'bg-blue-500 text-white' 
                    : 'text-blue-100 hover:bg-blue-700/60 hover:text-white'">
                        <FeatherIcon :type="item.icon" size="23" />
                        {{ item.name }}
                    </RouterLink>
                </nav>
    
                <!-- SIGN OUT -->
                <div class="px-3 py-4 border-t border-blue-700">
                    <button class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-blue-100
                    hover:bg-blue-700/60 hover:text-white w-full transition" @click="handleSignOut">
                    <FeatherIcon type="log-out" size="23" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import FeatherIcon from 'vue-feather'
import { useSidebar } from '@/composables/useSidebar'
import Logo from '@/assets/Inter/images/LoginLogo.png'
import { useToast } from 'vue-toastification'
import { userResource } from '@/data/user'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { isOpen } = useSidebar()

const navItems = [
  { name: 'Dashboard', to: '/', icon: 'home' },
  { name: 'Product Inventory', to: '/inventory', icon: 'box' },
  { name: 'Stock In / Receiving', to: '/stock-in', icon: 'download' },
  { name: 'Stock Out / Withdrawal', to: '/stock-out', icon: 'upload' },
  { name: 'Purchase Requests', to: '/purchase-requests', icon: 'file-plus' },
  { name: 'Returns', to: '/returns', icon: 'rotate-ccw' },
  { name: 'Reports', to: '/reports', icon: 'bar-chart-2' },
  { name: 'Suppliers', to: '/suppliers', icon: 'truck' },
  { name: 'Users', to: '/users', icon: 'users' },
  { name: 'Settings', to: '/settings', icon: 'settings' },
]

const isActive = (path) => route.path === path

async function handleSignOut() {
    try {
        const response = await fetch('http://cmip.localhost:8000/api/method/logout',
            {
                method: 'GET',
                credentials: 'include'
            }
        )

        if (response.ok) {
            // 1. Clear Local Storage
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('user')

            toast.success('Signed out successfully!')

            window.location.href = '/warehouse/login'
            
        } else {
            toast.error('Failed to sign out. Please try again.')
        }
    } catch (err) {
        console.error('Sign out error', err)
        toast.error('An error occured while signing out')
    }
}
</script>