<template>
    <div class="min-h-screen flex-1 p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition" >
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">
                        Stock Out / Withdrawal
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
                            {{ currentUser.username || 'User' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between">
            <div class="flex items-center">
                <p class="text-sm text-gray-600 font-medium">Record outgoing stock and manage withdrawals</p>
            </div>
            <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" class="w-4 h-4" />
                {{ formattedDate }}
            </div>
        </div>
        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="upload" icon-bg="bg-blue-100" icon-color="text-blue-600" label="Today's Issues"
            :value="withdrawalStats.todayIssues" caption="Total withdrawals today" />
            <StatCard icon="package" icon-bg="bg-green-100" icon-color="text-green-600" label="Total Items Issued"
            :value="withdrawalStats.totalItemsIssued" caption="Items issued today" />
            <StatCard icon="file-text" icon-bg="bg-orange-100" icon-color="text-orange-600" label="Today's Quantity Issued"
            :value="withdrawalStats.totalQuantityIssued" caption="Total quantity today" />
            <StatCard icon="box" icon-bg="bg-red-100" icon-color="text-red-600" label="Total Stock Value Issued"
            :value="withdrawalStats.totalStockValueIssued" caption="Total value today" />
        </div>
        <!-- MAIN LAYOUT -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="md:col-span-2 space-y-6">
                <!-- WITHDRAWAL INFORMATION -->
                <div class="p-6 rounded-xl border border-gray-300 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Withdrawal Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Reference No <span class="text-red-500">*</span></p>
                            <input type="text" v-model="form.reference_no" placeholder="e.g., RC-2026-0001" class="w-full px-3 py-2 text-sm
                            border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Date Issued <span class="text-red-500">*</span></p>
                            <input type="date" v-model="form.date_issued" class="w-full px-3 py-2 text-sm
                            border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Requested By <span class="text-red-500">*</span></p>
                            <input type="text" v-model="form.requested_by" disabled class="w-full px-3 py-2 text-sm border border-gray-400 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Department / To <span class="text-red-500">*</span></p>
                            <input type="text" v-model="form.department_to" placeholder="Enter department / location" class="w-full px-3 py-2 
                            text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Purpose / Reason <span class="text-red-500">*</span></p>
                            <select v-model="form.purpose" class="w-full px-3 py-2 text-sm border border-gray-400 rounded-md focus:outline-none
                            focus:ring-1 focus:ring-blue-500 cursor-pointer">
                                <option value="" disabled>Select reason</option>
                                <option v-for="reason, index in reasons" :key="index" :value="reason">{{ reason }}</option>
                            </select>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Notes</p>
                            <textarea v-model="form.notes" rows="5"  class="w-full text-sm border border-gray-400 rounded-md focus:outline-none 
                            focus:ring-1 focus:ring-blue-500 resize-none" placeholder="Enter any additional notes"></textarea>
                        </div>
                    </div>
                </div>
                <!-- ADD ITEM SECTION & ITEMS LIST TABLE -->
                <div class="p-6 rounded-xl border border-gray-300 shadow-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Add items</h3>
                        <button v-if="form.items.length > 0" @click="form.items = []" class="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100
                        px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition">
                            <FeatherIcon type="trash-2" class="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
                    <!-- SEARCH WITH DROPDOWN SUGGESTION -->
                    <div class="flex gap-3 mb-6 relative">
                        <div class="relative flex-1">
                            <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" v-model="search" placeholder="Search by product name or item code and select to add" 
                            class="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1
                            focus:ring-blue-500">
                            <!-- DROPDOWN RESULTS -->
                            <ul v-if="search && filteredProducts.length" class="absolute z-10 bg-white w-full border border-gray-200 mt-1 rounded-md
                            shadow-lg max-h-48 overflow-y-auto">
                                <li v-for="product in filteredProducts" :key="product.name" @click="addItem(product)" class="px-4 py-3
                                hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center">
                                    <div>
                                        <p class="font-medium text-sm text-gray-800">{{ product.product_name }}</p>
                                        <p class="text-xs text-gray-500">{{ product.item_code }} | Unit: {{ product.unit }}</p>
                                    </div>
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                        Stock: {{ product.current_stock || 0 }}
                                    </span>
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
                                    <th class="px-4 py-3 w-24">Available Stock</th>
                                    <th class="px-4 py-3 w-28">Issued Quantity</th>
                                    <th class="px-4 py-3 w-32">Unit Cost (₱)</th>
                                      <th class="px-4 py-3 w-32 text-right">Total Cost</th>
                                    <th class="px-4 py-3 w-16 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="form.items.length === 0">
                                    <td colspan="7" class="px-4 py-10 text-center text-gray-500">
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
                                        <p class="text-gray-800">{{ item.unit }}</p>
                                    </td>
                                    <td class="px-4 py-3 font-semibold text-blue-800">{{ item.available_stock }}</td>
                                    <td class="px-4 py-3">
                                        <input type="number" min="0" v-model.number="item.issue_qty" class="w-full px-2 py-1 border border-gray-300
                                        rounded text-sm focus:outline-none focus:border-blue-500 text-center">
                                    </td>
                                    <td class="px-4 py-3">
                                        <input type="number" min="0" step="0.01" v-model.number="item.unit_cost" class="w-full px-2 py-1 border 
                                        border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-center">
                                    </td>
                                    <td class="px-4 py-3 text-right font-semibold text-gray-800">
                                        ₱ {{ (item.issue_qty * item.unit_cost).toLocaleString('en-PH', {minimumFractionDigits: 2}) }}
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
            <!-- SUMMARY BOX -->
            <div class="md:col-span-1">
                <div class="p-6 rounded-xl border boder-gray-300 shadow-sm sticky top-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Total items</span>
                            <span class="font-bold text-gray-800">{{ summary.totalItems }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Total Quantity</span>
                            <span class="font-bold text-gray-800">{{ summary.totalQuantity }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Total Amount</span>
                            <span class="font-bold text-xl text-blue-800">
                               ₱ {{ summary.totalAmount.toLocaleString('en-PH', {minimumFractionDigits: 2}) }}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3">
                        <button @click="resetForm" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50
                        text-sm font-medium transition">
                            Cancel
                        </button>
                        <button @click="submitForm" :disabled="isSaving" class="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg 
                        flex items-center justify-center gap-2 text-sm font-medium transition disabled:opacity-70">
                            <FeatherIcon type="save" class="w-4 h-4" />
                            {{ isSaving ? 'Saving...' : 'Save Stock Out' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSidebar } from '../composables/useSidebar';
import FeatherIcon from 'vue-feather'
import { currentUser } from '../data/user';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import StatCard from '../components/StatCard.vue';
import { fetchStockWithdrawal, reloadStockWithdrawal, saveStockWithdrawal, withdrawalStats } from '../data/stockWithdrawal.js';
import { fetchProducts, productList } from '../data/product.js';
import { useToast } from 'vue-toastification';

onMounted(() => {
    fetchStockWithdrawal()
    fetchProducts()
})

const { toggle } = useSidebar()
const toast = useToast()

const search = ref('')
const isSaving = ref(false)

const form = reactive({
    reference_no: '',
    date_issued: todayLocalStr(),
    requested_by: '',
    department_to: '',
    purpose: '',
    notes: '',
    items: []
})

watch(currentUser, (u) => {
    if (u?.name) {
        form.requested_by = u.name
    }
}, { immediate: true })

const reasons = ['Construction Use', 'Production/Sales', 'Damaged/Defective', 'Transfer to Another Site', 'Other']

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })
)

const filteredProducts = computed(() => {
    const query = search.value.toLowerCase().trim()
    if (!query) return []

    return (productList.data || []).filter(product =>
        (product.product_name && product.product_name.toLowerCase().includes(query)) ||
        (product.item_code && product.item_code.toLowerCase().includes(query))
    )
})

const summary = computed(() => ({
    totalItems: form.items.length,
    totalQuantity: form.items.reduce((sum, item) => sum + (Number(item.issue_qty) || 0), 0),
    totalAmount: form.items.reduce((sum, item) => sum + (Number(item.issue_qty) || 0) * (Number(item.unit_cost) || 0), 0)
}))

function todayLocalStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

function addItem(product) {
    const exists = form.items.find(
        item => item.item_code === product.name || item.item_code === product.item_code
    )

    if (exists) {
        exists.issue_qty++
    } else {
        form.items.push({
            item_code: product.name || product.item_code,
            product_name: product.product_name,
            sku: product.sku,
            unit: product.unit,
            available_stock: product.current_stock,
            issue_qty: 1,
            unit_cost: 0,
            total_cost: 0
        })
    }
    search.value = ''
}

function removeItem(index) {
    form.items.splice(index, 1)
}

function resetForm() {
    form.reference_no = ''
    form.department_to = ''
    form.purpose = ''
    form.notes = ''
    form.items = []
    search.value = ''
}

async function submitForm() {
    if (!form.reference_no || !form.department_to || !form.purpose) {
        toast.error('Please fill in Reference No, Department, and Purpose.')
        return
    }

    if (form.items.length === 0) {
        toast.error('Please add at least one item.')
        return
    }

    if (!form.requested_by && currentUser.value?.name) {
        form.requested_by = currentUser.value.name
    }

    isSaving.value = true

    try {
        await saveStockWithdrawal(form)
        await reloadStockWithdrawal()
        toast.success('Stock Withdrawal recorded successfully!')
        resetForm()
        fetchStockWithdrawal()
    } catch (err) {
        console.error('Error saving Stock Out:', err)
        const message = err.messages?.[0] || err.message || 'Failed to save. Please try again.'
        toast.error(message)
    } finally {
        isSaving.value = false
    }
}
</script>