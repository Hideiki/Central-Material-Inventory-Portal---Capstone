<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600">
                    <FeatherIcon type="menu" />
                </button>
                <h2 class="text-2xl font-semibold text-gray-800">
                    Product Inventory
                </h2>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FeatherIcon type="user" class="text-blue-700" />
                    </div>
                    <div class="text-sm leading-tight">
                        <p class="font-semibold text-gray-800 text-base">{{ currentUser?.username || 'User' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- SUBHEADER -->
        <div class="flex justify-between">
            <div class="flex items-center">
                <p class="text-gray-600 text-sm font-medium">
                    View and manage all products and current stock levels
                </p>
            </div>
            <div class="flex items-center gap-2 bg-white/30 rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" size="15" />
                {{ formattedDate }}
            </div>
        </div>

        <!-- STATS CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                icon="box" 
                icon-bg="bg-blue-100" 
                icon-color="text-blue-600" 
                label="Total Items"
                :value="productStats.totalItems" 
                caption="All items in inventory" 
            />
            <StatCard 
                icon="package" 
                icon-bg="bg-green-200" 
                icon-color="text-green-600" 
                label="Total Stock Quantity"
                :value="productStats.totalQuantity" 
                caption="All items quantity" 
            />
            <StatCard 
                icon="alert-triangle" 
                icon-bg="bg-orange-100" 
                icon-color="text-orange-600" 
                label="Low Stock Items"
                :value="productStats.lowStock" 
                caption="Need to reorder" 
            />
            <StatCard 
                icon="x-circle" 
                icon-bg="bg-red-100" 
                icon-color="text-red-600" 
                label="Out of Stock Items"
                :value="productStats.outOfStock" 
                caption="No available stock" 
            />
        </div>

        <!-- ERROR STATE -->
        <div v-if="productList.error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            Failed to load products: {{ productList.error.message || productList.error }}
        </div>

        <!-- LOADING STATE -->
        <div v-if="productList.loading" class="text-center py-8">
            <p class="text-gray-500">Loading products...</p>
        </div>

        <!-- SEARCH AND TABLE CARD -->
        <div v-else class="bg-white border border-gray-300 shadow-sm rounded-2xl overflow-hidden">
            <!-- SEARCH AND FILTERS -->
            <div class="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-gray-200">
                <div class="relative flex-1 w-full">
                    <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Search by product name, SKU, or item code" 
                        class="pl-10 px-4 py-2 rounded-lg w-full text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                </div>
                <div class="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        v-model="selectedCategory"
                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                    <select 
                        v-model="selectedStatus"
                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <button 
                    @click="openAddModal"
                    class="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shrink-0"
                >
                    <FeatherIcon type="plus" size="16" /> Add New Product
                </button>
            </div>

            <!-- TABLE -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                            <th class="p-4 text-left font-semibold">Item Code</th>
                            <th class="p-4 text-left font-semibold">Product Name</th>
                            <th class="p-4 text-left font-semibold">SKU</th>
                            <th class="p-4 text-left font-semibold">Category</th>
                            <th class="p-4 text-left font-semibold">Unit</th>
                            <th class="p-4 text-left font-semibold">Current Stock</th>
                            <th class="p-4 text-left font-semibold">Reorder Level</th>
                            <th class="p-4 text-left font-semibold">Status</th>
                            <th class="p-4 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in paginatedItems" :key="item.name" class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="p-4 text-gray-600 font-medium">{{ item.item_code || item.name }}</td>
                            <td class="p-4 text-gray-800 font-medium">{{ item.product_name }}</td>
                            <td class="p-4 text-gray-600">{{ item.sku }}</td>
                            <td class="p-4 text-gray-600">{{ item.category }}</td>
                            <td class="p-4 text-gray-600">{{ item.unit }}</td>
                            <td class="p-4 font-semibold">{{ item.current_stock }}</td>
                            <td class="p-4 text-gray-600">{{ item.reorder_level }}</td>
                            <td class="p-4">
                                <span 
                                    class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                    :class="getStatusClass(item.status)"
                                >
                                    {{ item.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center justify-center gap-2">
                                    <button 
                                        @click="editItem(item)"
                                        class="text-blue-600 hover:text-blue-800 transition"
                                        title="Edit"
                                    >
                                        <FeatherIcon type="edit-2" size="16" />
                                    </button>
                                    <button 
                                        @click="openDeleteModal(item)"
                                        class="text-red-500 hover:text-red-700 transition"
                                        title="Delete"
                                    >
                                        <FeatherIcon type="trash-2" size="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <!-- Empty State -->
                        <tr v-if="filteredItems.length === 0">
                            <td colspan="9" class="p-8 text-center text-gray-500">
                                No products found. Try adjusting your search or filters.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PAGINATION -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                    Showing {{ filteredItems.length === 0 ? 0 : startIndex + 1 }} to {{ endIndex }} of {{ filteredItems.length }} entries
                </p>
                <div class="flex items-center gap-2">
                    <button 
                        @click="prevPage"
                        :disabled="currentPage === 1"
                        class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span class="text-sm text-gray-600">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                    <button 
                        @click="nextPage"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 
                        disabled:cursor-not-allowed transition">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ADD/EDIT MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">
                    {{ editingItem ? 'Edit Product' : 'Add New Product' }}
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
                    <FeatherIcon type="x" size="20" />
                </button>
            </div>

            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ formError }}
            </div>

            <form @submit.prevent="saveItem" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input 
                        v-model="form.item_code"
                        type="text" 
                        placeholder="Enter item code"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                        v-model="form.product_name"
                        type="text" 
                        placeholder="Enter product name"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input 
                            v-model="form.sku"
                            type="text" 
                            placeholder="SKU"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            v-if="!addingNewCategory"
                            v-model="form.category"
                            @change="handleCategoryChange"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select category</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            <option value="__new__">+ Add new category</option>
                        </select>
                        <div v-else class="flex gap-2">
                            <input
                                v-model="form.category"
                                type="text"
                                placeholder="New category name"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button type="button" @click="addingNewCategory = false; form.category = ''"
                                class="text-sm text-gray-500 hover:text-gray-700 shrink-0" title="Pick from list instead">
                                <FeatherIcon type="x" size="16" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input 
                            v-model="form.unit"
                            type="text" 
                            placeholder="e.g. pcs, box, kg"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                        <input 
                            v-model.number="form.current_stock"
                            type="number" 
                            min="0"
                            placeholder="0"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                        <input 
                            v-model.number="form.reorder_level"
                            type="number" 
                            min="0"
                            placeholder="0"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                        Cancel
                    </button>
                    <button type="submit" :disabled="saving" class="px-6 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg 
                    transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ saving ? 'Saving...' : (editingItem ? 'Update' : 'Add') + ' Product' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FeatherIcon type="trash-2" size="22" class="text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Delete this product?</h3>
                <p class="text-sm text-gray-600">
                    You're about to delete
                    <span class="font-medium text-gray-700">"{{ itemToDelete?.product_name }}"</span>.
                    This can't be undone.
                </p>
            </div>

            <div v-if="deleteError" class="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ deleteError }}
            </div>

            <div class="flex justify-end gap-4 mt-8">
                <button type="button" @click="closeDeleteModal"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-300 transition border border-gray-200 rounded-lg">
                    Cancel
                </button>
                <button type="button" @click="confirmDelete" :disabled="deleting"
                    class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium disabled:opacity-50 
                    disabled:cursor-not-allowed">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSidebar } from '../composables/useSidebar'
import FeatherIcon from 'vue-feather'
import { userResource, currentUser } from '../data/user'
import StatCard from '../components/StatCard.vue'
import { productList, productStats, fetchProducts, reloadProducts, addProduct, updateProduct, deleteProduct } from '../data/product.js'

/* LIFECYCLE */
onMounted(() => {
    userResource.fetch()
    fetchProducts()
})


/* COMPOSABLES */
const { toggle } = useSidebar()

const statusOptions = ['In Stock', 'Low Stock', 'Out of Stock']

function emptyForm() {
    return {
        item_code: '',
        product_name: '',
        sku: '',
        category: '',
        unit: '',
        current_stock: 0,
        reorder_level: 0,
    }
}

/* STATE */
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const showModal = ref(false)
const editingItem = ref(null)
const addingNewCategory = ref(false)
const saving = ref(false)
const formError = ref('')

// Delete confirmation modal state
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

const form = ref(emptyForm())

/* COMPUTED */
const allProducts = computed(() => productList.data || [])

const categories = computed(() => {
    const cats = allProducts.value.map((item) => item.category).filter(Boolean)
    return [...new Set(cats)]
})

const filteredItems = computed(() => {
    let items = allProducts.value

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        items = items.filter((item) =>
            item.product_name?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query) ||
            item.item_code?.toLowerCase().includes(query) ||
            item.name?.toLowerCase().includes(query)
        )
    }

    if (selectedCategory.value) {
        items = items.filter((item) => item.category === selectedCategory.value)
    }

    if (selectedStatus.value) {
        items = items.filter((item) => item.status === selectedStatus.value)
    }

    return items
})

const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / pageSize.value) || 1
})

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredItems.value.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredItems.value.length))

/* METHODS */
function getStatusClass(status) {
    if (status === 'In Stock') return 'bg-green-100 text-green-700'
    if (status === 'Low Stock') return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
}

function handleCategoryChange() {
    if (form.value.category === '__new__') {
        addingNewCategory.value = true
        form.value.category = ''
    }
}

function openAddModal() {
    editingItem.value = null
    formError.value = ''
    addingNewCategory.value = false
    form.value = emptyForm()
    showModal.value = true
}

function editItem(item) {
    editingItem.value = item
    formError.value = ''
    addingNewCategory.value = false
    form.value = {
        item_code: item.item_code || '',
        product_name: item.product_name || '',
        sku: item.sku || '',
        category: item.category || '',
        unit: item.unit || '',
        current_stock: item.current_stock || 0,
        reorder_level: item.reorder_level || 0,
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editingItem.value = null
    formError.value = ''
}

async function saveItem() {
    formError.value = ''
    saving.value = true

    try {
        if (editingItem.value) {
            await updateProduct(editingItem.value.name, { ...form.value })
        } else {
            await addProduct({ ...form.value })
        }
        reloadProducts()
        closeModal()
    } catch (error) {
        console.error('Error saving product:', error)
        formError.value = error?.message || 'Failed to save product. Please try again.'
    } finally {
        saving.value = false
    }
}

// --- Delete confirmation modal --- //
function openDeleteModal(item) {
    itemToDelete.value = item
    deleteError.value = ''
    showDeleteModal.value = true
}

function closeDeleteModal() {
    if (deleting.value) return // don't let them close mid-request
    showDeleteModal.value = false
    itemToDelete.value = null
    deleteError.value = ''
}

async function confirmDelete() {
    if (!itemToDelete.value) return
    deleteError.value = ''
    deleting.value = true

    try {
        await deleteProduct(itemToDelete.value.name)
        reloadProducts()
        showDeleteModal.value = false
        itemToDelete.value = null
    } catch (error) {
        console.error('Error deleting product:', error)
        deleteError.value = error?.message || 'Failed to delete product. Please try again.'
    } finally {
        deleting.value = false
    }
}

function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

/* DATE */
const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)
</script>