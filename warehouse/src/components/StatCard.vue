<template>
    <div class="bg-white rounded-2xl border border-gray-300 shadow-md p-5 flex items-start gap-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0" :class="iconBg">
            <FeatherIcon :type="icon" :class="iconColor" />
        </div>
        <div class="min-w-0">
            <p class="text-sm text-gray-500">{{ label }}</p>
            <p class="text-3xl font-semibold text-gray-800 mt-0.5">{{ value }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ caption }}</p>
        </div>
    </div>
</template>

<script setup>
import FeatherIcon from 'vue-feather'

defineProps({
    icon: {
        type: String,
        required: true
    },
    iconBg: {
        type: String,
        required: true
    },
    iconColor: { 
        type: String, 
        required: true 
    },
    label: { 
        type: String, 
        required: true 
    },
    value: { 
        type: [String, Number], 
        required: true 
    },
    caption: { 
        type: String, 
        required: true 
    },
})
</script>