<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition">
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">Materials Return</h2>
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
                <p class="text-sm text-gray-600 font-medium">
                    Process to return of materials to inventory due to overstock, defects, or other reasons
                </p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-300 shadow-sm">
                    <FeatherIcon type="calendar" class="w-4 h-4" />
                    {{ formattedDate }}
                </div>
            </div>
        </div>

        <!-- RETURN INFORMATION -->
        <div class="bg-white border border-gray-300 shadow-sm rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Return Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Return No. <span class="text-red-500">*</span></p>
                    <input type="text" v-model="form.return_no" placeholder="e.g., RET-2026-0001" class="w-full px-3 py-2 border border-gray-300 
                    rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Return Date <span class="text-red-500">*</span></p>
                    <input type="date" v-model="form.date_return" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                    focus:outline-none focus:ring-1 focus:ring-blue-500">
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Returned To <span class="text-red-500">*</span></p>
                    <select v-model="form.returned_to" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
                    focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="" disabled>Select warehouse</option>
                        <option v-for="wh in warehouseOptions" :key="wh" :value="wh">{{ wh }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Reference Type <span class="text-red-500">*</span></p>
                    <select v-model="form.reference_type" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
                    focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="" disabled>Select type</option>
                        <option v-for="type in referenceTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Requested By <span class="text-red-500">*</span></p>
                    <select v-model="form.requested_by" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
                    focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="" disabled>Select name</option>
                        <option v-for="u in usersList.data || []" :key="u.name" :value="u.name">{{ u.full_name }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Received By <span class="text-red-500">*</span></p>
                    <select v-model="form.received_by" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
                    focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="" disabled>Select name</option>
                        <option v-for="u in usersList.data || []" :key="u.name" :value="u.name">{{ u.full_name }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Reference No. <span class="text-red-500">*</span></p>
                    <select v-model="form.reference_no" :disabled="!form.reference_type" class="w-full px-3 py-2 border border-gray-300 
                    rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed">
                        <option value="" disabled>
                            {{ form.reference_type ? 'Select reference number' : 'Select Reference Type first' }}
                        </option>
                        <option v-for="ref in referenceOptions" :key="ref" :value="ref">{{ ref }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Department / Section <span class="text-red-500">*</span></p>
                    <select v-model="form.department_section" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
                    focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="" disabled>Select department</option>
                        <option v-for="dept in departmentOptions" :key="dept" :value="dept">{{ dept }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Return Status</p>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                        <FeatherIcon type="clock" size="12" />
                        Pending
                    </span>
                </div>
            </div>
        </div>

        <!-- RETURN ITEMS -->
        <div class="bg-white border border-gray-300 shadow-sm rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Return Items</h3>
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
                            <th class="px-4 py-3 min-w-[150px]">Item Description</th>
                            <th class="px-4 py-3 w-20">Unit</th>
                            <th class="px-4 py-3 w-28">Qty Returned</th>
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
                            <td class="px-4 py-3 text-gray-600">{{ item.unit }}</td>
                            <td class="px-4 py-3">
                                <input type="number" min="1" v-model.number="item.quantity_returned" class="w-full px-2 py-1 border border-gray-300
                                rounded text-sm focus:outline-none focus:border-blue-500 text-center">
                            </td>
                            <td class="px-4 py-3">
                                <input type="number" min="0" step="0.01" v-model.number="item.unit_cost" class="w-full px-2 py-1 border
                                border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-center">
                            </td>
                            <td class="px-4 py-3 text-right font-semibold text-gray-800">
                                ₱ {{ (item.quantity_returned * item.unit_cost).toLocaleString('en-PH', {minimumFractionDigits: 2}) }}
                            </td>
                            <td class="px-4 py-3 text-center">
                                <button @click="removeItem(index)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition">
                                    <FeatherIcon type="x" class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot v-if="form.items.length > 0">
                        <tr class="border-t border-gray-200">
                            <td colspan="4"></td>
                            <td class="px-4 py-3 text-sm font-semibold text-blue-700">TOTAL</td>
                            <td class="px-4 py-3 text-right font-bold text-blue-700">
                                ₱ {{ summary.totalAmount.toLocaleString('en-PH', {minimumFractionDigits: 2}) }}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- RETURN REASON -->
        <div class="bg-white border border-gray-300 shadow-sm rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Return Reason</h3>
            <select v-model="form.return_reason" class="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none 
            focus:ring-1 focus:ring-blue-500 cursor-pointer mb-4">
                <option value="" disabled>Select reason</option>
                <option v-for="r in returnReasons" :key="r" :value="r">{{ r }}</option>
            </select>
            <p class="text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</p>
            <textarea v-model="form.remarks" maxlength="255" rows="4" placeholder="Add any additional remarks..." class="w-full px-3 py-2
            border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
            <p class="text-xs text-gray-400 text-right mt-1">{{ form.remarks.length }} / 255</p>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex justify-end gap-3">
            <button @click="cancelForm" class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                Cancel
            </button>
            <button @click="submitForm('Pending')" :disabled="isSaving" class="px-6 py-2.5 border border-blue-300 text-blue-700 rounded-lg
            hover:bg-blue-50 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSaving && savingAs === 'Pending' ? 'Saving...' : 'Save as Draft' }}
            </button>
            <button @click="submitForm('Approved')" :disabled="isSaving" class="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg
            flex items-center justify-center gap-2 text-sm font-medium transition disabled:opacity-70">
                <FeatherIcon type="check-circle" class="w-4 h-4" />
                {{ isSaving && savingAs === 'Approved' ? 'Submitting...' : 'Submit Return' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { currentUser } from '../data/user'
import FeatherIcon from 'vue-feather'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSidebar } from '../composables/useSidebar'
import { useToast } from 'vue-toastification'
import { productList, fetchProducts } from '../data/product'
import { usersList, fetchUsers } from '../data/users'
import { stockReceivingList, fetchStockReceivings } from '../data/stockReceiving'
import { stockWithdrawalList, fetchStockWithdrawal } from '../data/stockWithdrawal'
import { saveMaterialReturn, fetchMaterialReturns, reloadMaterialReturns } from '../data/returns'

const { toggle } = useSidebar()
const toast = useToast()

onMounted(() => {
    fetchProducts()
    fetchUsers()
    fetchStockReceivings()
    fetchStockWithdrawal()
    fetchMaterialReturns()
})

const search = ref('')
const isSaving = ref(false)
const savingAs = ref('')

const warehouseOptions = ['Main Warehouse', 'Construction Site A', 'Construction Site B', 'Storage Facility']
const departmentOptions = ['Operations', 'Construction', 'Procurement', 'Administration', 'Warehouse', 'Other']
const referenceTypes = ['Stock In / Receiving', 'Stock Out / Withdrawal']
const returnReasons = ['Overstock / Excess', 'Damaged / Defective', 'Wrong Item', 'Quality Issue', 'Other']

const form = reactive({
    return_no: '',
    date_return: todayLocalStr(),
    returned_to: '',
    reference_type: '',
    reference_no: '',
    requested_by: '',
    received_by: '',
    department_section: '',
    return_reason: '',
    remarks: '',
    items: [],
})

function todayLocalStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)

const referenceOptions = computed(() => {
    if (form.reference_type === 'Stock In / Receiving') {
        return (stockReceivingList.data || []).map((r) => r.reference_no)
    }
    if (form.reference_type === 'Stock Out / Withdrawal') {
        return (stockWithdrawalList.data || []).map((r) => r.reference_no)
    }
    return []
})

// Reset the picked reference number whenever the type changes, since the
// old value may no longer be a valid option for the new type.
watch(() => form.reference_type, () => {
    form.reference_no = ''
})

const filteredProducts = computed(() => {
    const query = search.value.toLowerCase().trim()
    if (!query) return []

    return (productList.data || []).filter((product) =>
        (product.product_name && product.product_name.toLowerCase().includes(query)) ||
        (product.item_code && product.item_code.toLowerCase().includes(query))
    )
})

function addItem(product) {
    const exists = form.items.find(
        (item) => item.item_code === (product.name || product.item_code)
    )

    if (exists) {
        exists.quantity_returned++
    } else {
        form.items.push({
            item_code: product.name || product.item_code,
            product_name: product.product_name,
            unit: product.unit,
            quantity_returned: 1,
            unit_cost: 0,
        })
    }
    search.value = ''
}

function removeItem(index) {
    form.items.splice(index, 1)
}

const summary = computed(() => ({
    totalAmount: form.items.reduce(
        (sum, item) => sum + (Number(item.quantity_returned) || 0) * (Number(item.unit_cost) || 0),
        0
    ),
}))

function resetForm() {
    form.return_no = ''
    form.returned_to = ''
    form.reference_type = ''
    form.reference_no = ''
    form.requested_by = ''
    form.received_by = ''
    form.department_section = ''
    form.return_reason = ''
    form.remarks = ''
    form.items = []
    search.value = ''
}

function cancelForm() {
    resetForm()
}

async function submitForm(status) {
    if (!form.return_no || !form.returned_to || !form.reference_type || !form.reference_no
        || !form.requested_by || !form.received_by || !form.department_section || !form.return_reason) {
        toast.error('Please fill in all required fields')
        return
    }

    if (form.items.length === 0) {
        toast.error('Please add at least one item to return')
        return
    }

    isSaving.value = true
    savingAs.value = status

    try {
        await saveMaterialReturn({
            ...form,
            return_status: status,
        })

        reloadMaterialReturns()
        toast.success(status === 'Approved' ? 'Return submitted successfully!' : 'Return saved as draft.')
        resetForm()
        fetchMaterialReturns()
    } catch (err) {
        console.error('Error saving Material Return:', err)
        const message = err.messages?.[0] || err.message || 'Failed to save. Please try again'
        toast.error(message)
    } finally {
        isSaving.value = false
        savingAs.value = ''
    }
}
</script>