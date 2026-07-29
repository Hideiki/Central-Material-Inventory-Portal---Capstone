<template>
    <div class="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-200 to-blue-400 p-4">
        <div class="relative bg-white max-w-xl w-full px-6 md:px-8 py-10 rounded-2xl shadow-xl">
            <button class="absolute top-4 left-4 text-gray-500 hover:text-blue-800 p-2 border border-gray-500
            hover:border-blue-800 rounded-full transition-all duration-100 hover:scale-110 active:scale-95
            active:text-blue-800 flex"
            @click="$router.push('/login')">
                <FeatherIcon type="arrow-left" class="w-5 h-5" />
            </button>
            <!-- LOGO -->
            <div class="flex justify-center mb-4">
                <div class="w-24 h-24">
                    <img :src="Logo" alt="Login Logo" class="h-full w-full object-cover">
                </div>
            </div>
            <!-- HEADER -->
            <div class="text-center mb-8">
                <h1 class="text-2xl font-semibold text-blue-900 mb-1">
                    Create Account
                </h1>
                <p class="text-sm text-gray-500">
                    Fill in the details below to create your account
                </p>
            </div>
            <!-- FIELDS -->
            <form @submit.prevent="handleRegister" class="space-y-5">
                <div>
                    <p class="text-sm mb-2 text-gray-600">Full Name</p>
                    <div class="relative">
                        <FeatherIcon type="user" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none"/>
                        <input  v-model="form.fullName" type="text" placeholder="Enter your full name" class="w-full pl-10 px-4 py-1.5 
                        md:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 transition">
                    </div>
                </div>
                <div>
                    <p class="text-sm mb-2 text-gray-600">Username</p>
                    <div class="relative">
                        <FeatherIcon type="user" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none"/>
                        <input v-model="form.username" type="text" placeholder="Enter a username" class="w-full pl-10 px-4 py-1.5 
                        md:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 transition">
                    </div>
                </div>
                <div>
                    <p class="text-sm mb-2 text-gray-600">Email Address</p>
                    <div class="relative">
                        <FeatherIcon type="mail" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none"/>
                        <input v-model="form.email" type="text" placeholder="Enter your email address" class="w-full pl-10 px-4 py-1.5 
                        md:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 transition">
                    </div>
                </div>
                <div>
                    <p class="text-sm mb-2 text-gray-600">Password</p>
                    <div class="relative">
                        <FeatherIcon type="lock" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none"/>
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Create a password" 
                        class="w-full pl-10 px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 
                        focus:ring-blue-600 transition">
                        <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-500 hover:text-gray-700 transition">
                            <FeatherIcon :type="showPassword ? 'eye-off' : 'eye'" class="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div>
                    <p class="text-sm mb-2 text-gray-600">Confirm Password</p>
                    <div class="relative">
                        <FeatherIcon type="lock" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none"/>
                        <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm your password" 
                        class="w-full pl-10 px-4 py-1.5 md:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 
                        focus:ring-blue-600 transition">
                        <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-500 hover:text-gray-700 transition">
                            <FeatherIcon :type="showConfirmPassword ? 'eye-off' : 'eye'" class="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 <!-- CREATE ACCOUNT BUTTON -->
                <div class="mt-10">
                    <button type="submit" class="w-full text-center font-semibold text-white bg-blue-700 hover:bg-blue-600 py-3 rounded-lg 
                    transition disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading">
                        {{ loading ? 'Creating Account...' : 'Create Account' }}
                    </button>
                </div>
            </form>
            <div v-if="error" class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ error }}
            </div>
            <!-- OR DIVIDER -->
            <div class="flex items-center my-6">
                <div class="flex-grow h-px bg-gray-300"></div>
                <span class="flex-shrink text-gray-400 px-4 text-sm font-medium">or</span>
                <div class="flex-grow h-px bg-gray-300"></div>
            </div>
            <div class="flex items-center justify-center gap-1">
                <p class="text-gray-500 text-sm">Already have an account?</p>
                <RouterLink to="/login" class="text-sm text-blue-700 font-semibold hover:underline">
                    Sign In
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script setup>
import FeatherIcon from 'vue-feather'
import Logo from '@/assets/Inter/images/LoginLogo.png'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
})

function validatePassword(password) {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long'
    }
     if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain at least one special character'
    }
    return null
}

async function handleRegister() {
    error.value = ''

    if (!form.email || !form.email.includes('@') || !form.email.includes('.')) {
        error.value = 'Please enter a valid email address'
        toast.error(error.value)
        return
    }

    const passwordError = validatePassword(form.password)
    if (passwordError) {
        error.value = passwordError
        toast.error(passwordError)
        return
    }

    if (form.password !== form.confirmPassword) {
        error.value = 'Passwords do not match'
        toast.error(error.value)
        return
    }

    if (!form.fullName || !form.username || !form.email) {
        error.value = 'Please fill in all required fields'
        toast.error(error.value)
        return
    }

    loading.value = true

    console.log("Sending registration...", form)

    try {
        const response = await fetch('http://cmip.localhost:8000/api/method/cmip.api.register_user',
            {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: form.email,
                    first_name: form.fullName,
                    username: form.username,
                    new_password: form.password
                })
            }
        )
        console.log("Response received:", response)

        const data = await response.json()

        console.log("Response data:", data)

        if (response.ok) {
            toast.success('Account created successfully!')
            router.push({
                name: 'Login'
            })
        }
        else {
            if (data.exception) {
                // Check if it's a password error
                if (data.exception.includes('common password')) {
                    error.value = 'Password is too common. Please choose a stronger password.'
                } else if (data.exception.includes('Duplicate')) {
                    error.value = 'Email or username already exists.'
                } else {
                    error.value = data.exception || 'Registration failed'
                }
            } else if (data._server_messages) {
                try {
                    const messages = JSON.parse(data._server_messages)
                    if (messages.length > 0) {
                        const msg = JSON.parse(messages[0])
                        error.value = msg.message || 'Registration failed'
                    }
                } catch {
                    error.value = data.message || 'Registration failed'
                }
            } else {
                error.value = data.message || 'Registration failed'
            }
            toast.error(error.value)
        }
    } catch (err) {
        console.error("REGISTER ERROR:", err)
        error.value = err.message
    } finally {
        loading.value = false
    }
}
</script>
