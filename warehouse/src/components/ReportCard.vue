<template>
    <div class="bg-white rounded-2xl border border-gray-300 shadow-md p-5 flex items-start gap-4">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white" :class="iconBg">
            <FeatherIcon :type="icon" class="w-7 h-7" />
        </div>
        <div class="min-w-0">
            <p class="text-lg font-medium text-gray-800">{{ label }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ caption }}</p>
            <button @click="$emit('view')" class="px-6 py-2 rounded-md bg-white text-sm mt-5" :class="buttonColor">
                View Report
            </button>
        </div>
    </div>
</template>

<script setup>
import FeatherIcon from 'vue-feather'

defineProps({
    icon: {
        type: String,
    },
    iconBg: {
        type: String
    },
    label: {
        type: String
    },
    caption: {
        type: String
    },
    buttonColor: {
        type: String
    }
})

defineEmits(['view'])
</script>