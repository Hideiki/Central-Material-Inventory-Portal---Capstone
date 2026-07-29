<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 p-4">
        <div class="w-full max-w-md">
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <!-- ICON -->
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <FeatherIcon type="lock" class="text-blue-600" size="28" />
                    </div>
                </div>

                <!-- HEADING -->
                <h1 class="text-xl font-bold text-gray-800 text-center mb-2">Forgot Password?</h1>
                <p class="text-sm text-gray-500 text-center mb-6">
                    Enter your registered email address and we'll send you instructions to reset your password.
                </p>

                <!-- SUCCESS STATE -->
                <div v-if="sent" class="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                    If an account exists for <span class="font-medium">{{ email }}</span>, a reset link has been sent. Please check your inbox (and spam folder).
                </div>

                <!-- ERROR STATE -->
                <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleSendResetLink" class="space-y-4">
                    <!-- EMAIL FIELD -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div class="relative">
                            <FeatherIcon type="mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" v-model="email" required placeholder="Enter your email address" 
                            :disabled="sending || sent" class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                            focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-70"/>
                        </div>
                    </div>

                    <!-- SEND RESET LINK -->
                    <button type="submit" :disabled="sending || sent" class="w-full flex items-center justify-center gap-2 bg-blue-700 
                    hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60 
                    disabled:cursor-not-allowed">
                        <FeatherIcon type="send" size="16" />
                        {{ sending ? 'Sending...' : (sent ? 'Link Sent' : 'Send Reset Link') }}
                    </button>
                </form>

                <!-- OR DIVIDER -->
                <div class="flex items-center gap-3 my-5">
                    <div class="flex-1 h-px bg-gray-200"></div>
                    <span class="text-xs text-gray-400">OR</span>
                    <div class="flex-1 h-px bg-gray-200"></div>
                </div>

                <!-- BACK TO LOGIN -->
                <RouterLink to="/login" class="w-full flex items-center justify-center gap-2 border border-blue-700 text-blue-700 
                font-medium py-2.5 rounded-lg hover:bg-blue-700 hover:text-white transition">
                    <FeatherIcon type="arrow-left" size="16" />
                    Back to Login
                </RouterLink>
            </div>

            <!-- FOOTER -->
            <p class="text-center text-sm text-gray-800 mt-6">
                Remember your password?
                <RouterLink to="/login" class="text-blue-700 font-medium hover:underline">Login here</RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import FeatherIcon from 'vue-feather'
import { sendPasswordResetLink } from '../data/passwordReset.js'

const email = ref('')
const sending = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function handleSendResetLink() {
    errorMessage.value = ''

    if (!email.value.trim()) {
        errorMessage.value = 'Please enter your email address.'
        return
    }

    sending.value = true
    try {
        await sendPasswordResetLink(email.value.trim())
        sent.value = true
    } catch (err) {
        console.error('Error sending reset link:', err)
        errorMessage.value = err?.message || 'Something went wrong. Please try again later.'
    } finally {
        sending.value = false
    }
}
</script>