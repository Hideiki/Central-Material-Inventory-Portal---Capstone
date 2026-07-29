<template>
  <div class="flex min-h-screen">
    <AppSidebar v-if="showSidebar" />
    <RouterView class="flex-1"/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()
const showSidebar = computed(() => !route.meta.hideSidebar)
</script>