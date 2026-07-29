import { ref } from 'vue'

const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
}

export function useSidebar() {
  return { isOpen, toggle }
}