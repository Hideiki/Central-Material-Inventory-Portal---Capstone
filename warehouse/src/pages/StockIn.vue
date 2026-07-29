<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition">
                    <FeatherIcon type="menu" /> 
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">
                        Stock In / Receiving
                    </h2>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FeatherIcon type="user" class="text-blue-700" />
                    </div>
                    <div class="text-sm leading-tight">
                        <p class="font-semibold text-base text-gray-800">
                            {{ currentUser?.username || 'User' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between">
            <div class="flex items-center">
                <p class="text-sm text-gray-600 font-medium">Record incoming stock and update inventory</p>
            </div>
            <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" class="w-4 h-4" />
                {{ formattedDate }}
            </div>
        </div>

        <!-- STATS CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="download" icon-bg="bg-blue-100" icon-color="text-blue-600" label="Today's Receipts"
            :value="receivingStats.todayReceipts" caption="Total received today" />
            <StatCard icon="package" icon-bg="bg-green-100" icon-color="text-green-600" label="Total Items Received"
            :value="receivingStats.totalItemsReceived" caption="Items received today" />
            <StatCard icon="file-text" icon-bg="bg-orange-100" icon-color="text-orange-600" label="Today's Quantity Received"
            :value="receivingStats.totalQuantityReceived" caption="Total quantity today" />
            <StatCard icon="box" icon-bg="bg-red-100" icon-color="text-red-600" label="Total Stock Value"
            :value="receivingStats.totalStockValue" caption="Total value today" />
        </div>

        <!-- MAIN LAYOUT -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="md:col-span-2 space-y-6">
                <!-- RECEIVING INFORMATION FORM -->
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Receiving Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Reference No. <span class="text-red-500">*</span></p>
                            <input type="text" v-model="form.reference_no" placeholder="e.g., RC-2026-0001" class="w-full px-3 py-2 border 
                            border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Date Received <span class="text-red-500">*</span></p>
                            <input type="date" v-model="form.date_received" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                            focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Supplier <span class="text-red-500">*</span></p>
                            <input type="text" v-model="form.supplier" placeholder="Enter supplier" class="w-full px-3 py-2 border border-gray-300 
                            rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Purchase Request / PO No.</p>
                            <input type="text" v-model="form.po_no" placeholder="e.g., PO-2026-0001" class="w-full px-3 py-2 border 
                            border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                    </div>
                </div>

                <!-- ADD ITEM SECTION & ITEMS LIST TABLE -->
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Add Items</h3>
                        <button v-if="form.items.length > 0" @click="form.items = []" class="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition">
                            <FeatherIcon type="trash-2" class="w-4 h-4" /> 
                            Clear All
                        </button>
                    </div>
                    
                    <!-- Search with Dropdown Suggestion -->
                    <div class="flex gap-3 mb-6 relative">
                        <div class="relative flex-1">
                            <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" v-model="search" placeholder="Search by product name or item code and select to add" class="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                            
                            <!-- Dropdown Results -->
                            <ul v-if="search && filteredProducts.length" class="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                <li v-for="product in filteredProducts" :key="product.name" @click="addItem(product)" class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center">
                                    <div>
                                        <p class="font-medium text-sm text-gray-800">{{ product.product_name }}</p>
                                        <p class="text-xs text-gray-500">{{ product.item_code }} | Unit: {{ product.unit }}</p>
                                    </div>
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Stock: {{ product.current_stock || 0 }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- TABLE -->
                    <div class="border border-gray-200 rounded-lg overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-3 w-10">#</th>
                                    <th class="px-4 py-3 min-w-[150px]">Product Info</th>
                                    <th class="px-4 py-3 w-20">Unit</th>
                                    <th class="px-4 py-3 w-24">Order Qty</th>
                                    <th class="px-4 py-3 w-28">Received Qty</th>
                                    <th class="px-4 py-3 w-32">Unit Cost (₱)</th>
                                    <th class="px-4 py-3 w-32 text-right">Total Cost</th>
                                    <th class="px-4 py-3 w-16 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="form.items.length === 0">
                                    <td colspan="8" class="px-4 py-10 text-center text-gray-400">
                                        <FeatherIcon type="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p class="font-medium">No items added yet</p>
                                        <p class="text-xs">Search and click a product above to add.</p>
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in form.items" :key="index" class="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td class="px-4 py-3 font-semibold text-gray-600">{{ index + 1 }}</td>
                                    <td class="px-4 py-3">
                                        <p class="font-medium text-gray-800">{{ item.product_name }}</p>
                                        <p class="text-xs text-gray-500">{{ item.item_code }}</p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <p class="text-gray-600">{{ item.unit }}</p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <input type="number" min="0" v-model.number="item.ordered_qty" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-center">
                                    </td>
                                    <td class="px-4 py-3">
                                        <input type="number" min="1" v-model.number="item.received_qty" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-center bg-blue-50">
                                    </td>
                                    <td class="px-4 py-3">
                                        <input type="number" min="0" step="0.01" v-model.number="item.unit_cost" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-right">
                                    </td>
                                    <td class="px-4 py-3 text-right font-semibold text-gray-800">
                                        ₱ {{ (item.received_qty * item.unit_cost).toLocaleString('en-PH', {minimumFractionDigits: 2}) }}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <button @click="removeItem(index)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition">
                                            <FeatherIcon type="x" class="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- RIGHT AREA (Summary Box) -->
            <div class="md:col-span-1">
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                    
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Total Items</span>
                            <span class="font-bold text-gray-800">{{ summary.totalItems }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Total Quantity</span>
                            <span class="font-bold text-gray-800">{{ summary.totalQuantity }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                            <span class="text-gray-600 font-medium">Total Amount</span>
                            <span class="font-bold text-xl text-blue-700">₱ {{ summary.totalAmount.toLocaleString('en-PH', {minimumFractionDigits: 2}) }}</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-3">
                        <button type="button" @click="resetForm" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                            Cancel
                        </button>
                        <button @click="submitForm" :disabled="isSaving" class="w-full py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm font-medium transition disabled:opacity-70">
                            <FeatherIcon type="save" class="w-4 h-4" />
                            {{ isSaving ? 'Saving...' : 'Save Stock In' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useSidebar } from '../composables/useSidebar'
import FeatherIcon from 'vue-feather'
import StatCard from '../components/StatCard.vue'
import { receivingStats, saveStockReceiving, fetchStockReceivings, reloadStockReceivings } from '../data/stockReceiving'
import { productList, fetchProducts } from '../data/product'
import { currentUser } from '../data/user.js'
import { useToast } from 'vue-toastification'

const { toggle } = useSidebar()
const toast = useToast()

const search = ref('')
const isSaving = ref(false)

const form = reactive({
    reference_no: '',
    date_received: todayLocalStr(), // Default sa today
    supplier: '',
    po_no: '',
    received_by: '',
    items: []
})

const formattedDate = computed(() => 
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })
)

// Filter based on search input
const filteredProducts = computed(() => {
    const query = search.value.toLowerCase().trim()
    if (!query) return []

    return (productList.data || []).filter(product =>
        (product.product_name && product.product_name.toLowerCase().includes(query)) ||
        (product.item_code && product.item_code.toLowerCase().includes(query))
    )
})

function todayLocalStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

// Add Item to table
function addItem(product) {
    const exists = form.items.find(
        item => item.item_code === product.name || item.item_code === product.item_code
    )

    if (exists) {
        exists.received_qty++
    } else {
        form.items.push({
            item_code: product.name || product.item_code,
            product_name: product.product_name,
            sku: product.sku,
            unit: product.unit,
            ordered_qty: 0,
            received_qty: 1,
            unit_cost: 0,
            total_cost: 0
        })
    }
    search.value = ''
}

// Remove item from table
function removeItem(index) {
    form.items.splice(index, 1)
}

// Reset form
function resetForm() {
    form.reference_no = ''
    form.supplier = ''
    form.po_no = ''
    form.notes = ''
    form.items = []
    search.value = ''
}

// Dynamic Summary Computation
const summary = computed(() => ({
    totalItems: form.items.length,
    totalQuantity: form.items.reduce((sum, item) => sum + (Number(item.received_qty) || 0), 0),
    totalAmount: form.items.reduce((sum, item) => sum + ((Number(item.received_qty) || 0) * (Number(item.unit_cost) || 0)), 0)
}))

// Save Function to Backend
async function submitForm() {
    if (!form.reference_no || !form.date_received || !form.supplier) {
        toast.error("Please fill in Reference No, Date, and Supplier.")
        return
    }

    if (form.items.length === 0) {
        toast.error("Please add at least one item.")
        return
    }

    if (window.frappe && window.frappe.session) {
        form.received_by = window.frappe.session.user
    }

    isSaving.value = true

    try {
        await saveStockReceiving(form)
        await reloadStockReceivings()
        toast.success("Stock Receiving recorded successfully!")
        resetForm()
        fetchStockReceivings() // Reload stats
    } catch (error) {
        console.error("Error saving Stock In:", error)
        toast.error("Failed to save. That reference no. is already recorded.")
    } finally {
        isSaving.value = false
    }
}

// Load external data on mount
onMounted(() => {
    fetchStockReceivings()
    fetchProducts()
})
</script>