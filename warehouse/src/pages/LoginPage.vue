<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 p-4">
        <div class="bg-white max-w-md w-full px-6 md:px-8 py-10 rounded-2xl shadow-xl">
            <!-- IMAGE  -->
            <div class="flex justify-center mb-4">
                <div class="w-24 h-24">
                    <img :src="Logo" alt="Login Logo" class="h-full w-full object-contain">
                </div>
            </div>
            <!-- HEADER -->
            <div class="text-center mb-8">
                <h1 class="text-2xl font-semibold text-blue-900 mb-1">
                    Centralized Materials Inventory Portal
                </h1>
                <p class="text-sm text-gray-500">Please sign in to continue</p>
            </div>
            <!-- ERROR MESSAGE -->
            <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ error }}
            </div>
            <!-- FIELDS -->
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div class="relative w-full">
                    <FeatherIcon type="user" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                    <input v-model="form.email" type="text" placeholder="Email address" class="w-full pl-10 px-4 py-1.5 md:py-2.5 
                    rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 transition">
                </div>
                <div class="relative w-full">
                    <FeatherIcon type="lock" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Password" 
                    class="w-full pl-10 px-4 py-1.5 md:py-2.5  rounded-lg border border-gray-300 focus:outline-none focus:ring-1 
                    focus:ring-blue-600 transition">
                    <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600
                    hover:text-gray-800 transition">
                        <FeatherIcon :type="showPassword ? 'eye-off' : 'eye'" class="w-5 h-5" />
                    </button>
                </div>
                <!-- OPTIONS -->
                <div class="flex items-center justify-between mt-6 md:mt-4">
                    <div class="flex items-center gap-2">
                        <input v-model="form.remember" type="checkbox" id="remember-me" class="w-4 h-4 cursor-pointer accent-blue-800">
                        <label for="remember-me" class="text-sm text-gray-600">Remember me</label>
                    </div>
                    <RouterLink to="/forgot-password" class="text-blue-900 hover:underline text-sm font-medium">
                        Forgot password?
                    </RouterLink>
                </div>
                <div class="mt-6">
                    <button type="submit" class="w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-lg text-white disabled:opacity-50
                    disabled:cursor-not-allowed font-semibold transition" :disabled="loading">
                        {{ loading ? 'Signing In...' : 'Sign In' }}
                    </button>
                </div>
            </form>
            <!-- OR DIVIDER -->
            <div class="flex items-center my-6">
                <div class="flex-grow h-px bg-gray-300"></div>
                <span class="flex-shrink text-gray-400 px-4 text-sm font-medium">or</span>
                <div class="flex-grow h-px bg-gray-300"></div>
            </div>
            <div class="flex items-center justify-center gap-1">
                <p class="text-gray-500 text-sm">Don't have an account?</p>
                <RouterLink to="/register" class="text-sm text-blue-700 font-semibold hover:underline">
                    Create Account
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Logo from '@/assets/Inter/images/LoginLogo.png'
import FeatherIcon from 'vue-feather'
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { userResource } from '../data/user';

const router = useRouter()

const form = reactive({
    email: '',
    password: '',
    remember: false
})

const toast = useToast()
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
    loading.value = true
    error.value = ''

    if (!form.email || !form.password) {
        error.value = 'Please enter both username and password'
        loading.value = false
        return
    }

    try {
        const response = await fetch('http://cmip.localhost:8000/api/method/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    usr: form.email,
                    pwd: form.password
                })
            }
        )
        if (response.redirected) {
            // Login success - na-redirect sa dashboard
            console.log('Login success, redirecting...')
            toast.success('Login successful!')
            // I-save ang session
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('username', form.username)
            await userResource.fetch()
            router.push('/')
            return
        }
        
        const data = await response.json()

        if (response.ok) {
            console.log('Login success', data)
            toast.success('Login successful!')
            localStorage.setItem('isLoggedIn', 'true')
            if (data.data) {
                localStorage.setItem('user', JSON.stringify(data.data))
            }
            await userResource.fetch()

            router.push('/')
        } else {
            if (data.message) {
                if (data.message.includes('invalid')) {
                    error.value = 'Invalid username or password. Please try again.'
                } else if (data.message.includes('not found')) {
                    error.value = 'User not found. Please check your username.'
                } else {
                    error.value = data.message
                }
            } else if (data.exception) {
                error.value = data.exception
            } else {
                error.value = 'Invalid credentials. Please try again.'
            }
        }
    } catch(err) {
        console.error('LOGIN ERROR:', err)
        error.value = 'Cannot connect to server. Please check your network.'
    } finally {
        loading.value = false
    }
}
</script>