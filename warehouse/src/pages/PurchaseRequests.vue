<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition">
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">Purchase Request</h2>
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
                    Create, manage and track all requested materials before receiving.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-300 shadow-sm">
                    <FeatherIcon type="calendar" class="w-4 h-4" />
                    {{ formattedDate }}
                </div>
                <button
                    @click="openAddModal"
                    class="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
                >
                    <FeatherIcon type="plus" class="w-4 h-4" />
                    New Purchase Request
                </button>
            </div>
        </div>

        <!-- ERROR STATE -->
        <div v-if="purchaseRequestList.error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            Failed to load purchase requests: {{ purchaseRequestList.error.message || purchaseRequestList.error }}
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="file-text" icon-bg="bg-blue-100" icon-color="text-blue-600" label="Total Requests"
            :value="purchaseRequestStats.totalRequests" caption="All time" />
            <StatCard icon="clock" icon-bg="bg-orange-100" icon-color="text-orange-600" label="Pending"
            :value="purchaseRequestStats.pending" caption="Awaiting approval" />
            <StatCard icon="check" icon-bg="bg-green-100" icon-color="text-green-600" label="Approved"
            :value="purchaseRequestStats.approved" caption="For receiving" />
            <StatCard icon="package" icon-bg="bg-violet-100" icon-color="text-violet-600" label="Received"
            :value="purchaseRequestStats.received" caption="Completed" />
        </div>

        <!-- LOADING STATE -->
        <div v-if="purchaseRequestList.loading" class="text-center py-8">
            <p class="text-gray-500">Loading purchase requests...</p>
        </div>

        <!-- SEARCH + FILTERS + TABLE CARD -->
        <div v-else class="bg-white border border-gray-300 shadow-sm rounded-2xl overflow-hidden">
            <div class="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-gray-200">
                <div class="relative flex-1 w-full">
                    <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search request no., item, or supplier..."
                        class="pl-10 px-4 py-2 rounded-lg w-full text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div class="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    <select v-model="statusFilter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input
                        v-model="dateFilter"
                        type="date"
                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <!-- TABLE -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
                        <tr>
                            <th class="p-4 text-left font-semibold">Request No.</th>
                            <th class="p-4 text-left font-semibold">Date Requested</th>
                            <th class="p-4 text-left font-semibold">Requested By</th>
                            <th class="p-4 text-left font-semibold">Supplier</th>
                            <th class="p-4 text-left font-semibold">Total Items</th>
                            <th class="p-4 text-left font-semibold">Status</th>
                            <th class="p-4 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in paginatedItems" :key="row.name" class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="p-4 font-medium text-gray-800">{{ row.request_no || row.name }}</td>
                            <td class="p-4 text-gray-600">{{ formatDate(row.date_requested) }}</td>
                            <td class="p-4 text-gray-600">{{ row.requested_by }}</td>
                            <td class="p-4 text-gray-600">{{ row.supplier }}</td>
                            <td class="p-4 text-gray-600">{{ row.total_items }}</td>
                            <td class="p-4">
                                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" :class="statusBadgeClass(row.status)">
                                    {{ row.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="openViewModal(row)" class="text-gray-500 hover:text-blue-600 transition" title="View">
                                        <FeatherIcon type="eye" size="16" />
                                    </button>
                                    <div class="relative">
                                        <button
                                            :ref="el => setMenuBtnRef(el, row.name)"
                                            @click.stop="toggleActionsMenu(row)"
                                            class="text-gray-500 hover:text-gray-700 transition"
                                            title="Actions"
                                        >
                                            <FeatherIcon type="more-vertical" size="16" />
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredItems.length === 0">
                            <td colspan="7" class="p-8 text-center text-gray-500">
                                No purchase requests found. Try adjusting your search or filters.
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
                <div class="flex items-center gap-1">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100">
                        <FeatherIcon type="chevron-left" class="w-4 h-4" />
                    </button>
                    <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
                        :class="page === currentPage ? 'bg-blue-700 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'">
                        {{ page }}
                    </button>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100">
                        <FeatherIcon type="chevron-right" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ACTIONS DROPDOWN (teleported to body so it's never clipped by table/card overflow) -->
    <Teleport to="body">
        <div
            v-if="activeMenu"
            ref="menuRef"
            class="fixed w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
            :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
            @click.stop
        >
            <button
                v-if="activeMenuRow?.status === 'Pending'"
                @click="changeStatus(activeMenuRow, 'Approved')"
                class="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50"
            >
                Approve
            </button>
            <button
                v-if="activeMenuRow?.status === 'Pending'"
                @click="changeStatus(activeMenuRow, 'Rejected')"
                class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
                Reject
            </button>
            <button
                v-if="activeMenuRow?.status === 'Approved'"
                @click="changeStatus(activeMenuRow, 'Received')"
                class="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50"
            >
                Mark as Received
            </button>
            <button
                @click="openDeleteModal(activeMenuRow)"
                class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
                Delete
            </button>
        </div>
    </Teleport>

    <!-- NEW PURCHASE REQUEST MODAL -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">New Purchase Request</h3>
                <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 transition">
                    <FeatherIcon type="x" size="20" />
                </button>
            </div>

            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ formError }}
            </div>

            <!-- REQUEST INFO -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Request No <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.request_no" placeholder="e.g. PR-2026-0001" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date Requested <span class="text-red-500">*</span></label>
                    <input type="date" v-model="form.date_requested" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Requested By <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.requested_by" disabled class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 disabled:opacity-70" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Supplier <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.supplier" placeholder="Enter supplier" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
            </div>

            <!-- ADD ITEMS SECTION -->
            <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="text-sm font-semibold text-gray-800">Items</h4>
                    <button v-if="form.items.length > 0" @click="form.items = []" type="button"
                        class="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs flex items-center gap-1 transition">
                        <FeatherIcon type="trash-2" class="w-3.5 h-3.5" />
                        Clear All
                    </button>
                </div>

                <!-- SEARCH PRODUCT TO ADD -->
                <div class="relative mb-4">
                    <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" v-model="search" placeholder="Search by product name or item code and select to add"
                        class="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <ul v-if="search && filteredProducts.length" class="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        <li v-for="product in filteredProducts" :key="product.name" @click="addItem(product)"
                            class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center">
                            <div>
                                <p class="font-medium text-sm text-gray-800">{{ product.product_name }}</p>
                                <p class="text-xs text-gray-500">{{ product.item_code }} | Unit: {{ product.unit }}</p>
                            </div>
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Stock: {{ product.current_stock || 0 }}</span>
                        </li>
                    </ul>
                </div>

                <!-- ITEMS TABLE -->
                <div class="border border-gray-200 rounded-lg overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 w-10">#</th>
                                <th class="px-4 py-3 min-w-[150px]">Product Info</th>
                                <th class="px-4 py-3 w-20">Unit</th>
                                <th class="px-4 py-3 w-24">Qty</th>
                                <th class="px-4 py-3 w-32">Unit Price (₱)</th>
                                <th class="px-4 py-3 w-32 text-right">Amount</th>
                                <th class="px-4 py-3 w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="form.items.length === 0">
                                <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                                    <FeatherIcon type="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p class="font-medium">No items added yet</p>
                                    <p class="text-xs">Search and click a product above to add.</p>
                                </td>
                            </tr>
                            <tr v-for="(item, index) in form.items" :key="index" class="border-b border-gray-100 hover:bg-gray-50/50">
                                <td class="px-4 py-3 font-semibold text-gray-600">{{ index + 1 }}</td>
                                <td class="px-4 py-3">
                                    <p class="font-medium text-gray-800">{{ item.item }}</p>
                                    <p class="text-xs text-gray-500">{{ item.item_code }}</p>
                                </td>
                                <td class="px-4 py-3 text-gray-600">{{ item.unit }}</td>
                                <td class="px-4 py-3">
                                    <input type="number" min="1" v-model.number="item.quantity"
                                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-blue-500" />
                                </td>
                                <td class="px-4 py-3">
                                    <input type="number" min="0" step="0.01" v-model.number="item.unit_price"
                                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-blue-500" />
                                </td>
                                <td class="px-4 py-3 text-right font-semibold text-gray-800">
                                    ₱ {{ (item.quantity * item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button @click="removeItem(index)" type="button" class="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition">
                                        <FeatherIcon type="x" class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SUMMARY -->
            <div class="flex items-center justify-end gap-6 border-t border-gray-200 pt-4 mb-4 text-sm">
                <span class="text-gray-600">Total Items: <span class="font-semibold text-gray-800">{{ summary.totalItems }}</span></span>
                <span class="text-gray-600">Total Qty: <span class="font-semibold text-gray-800">{{ summary.totalQuantity }}</span></span>
                <span class="text-gray-600">Total Amount:
                    <span class="font-bold text-blue-800">₱ {{ summary.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                </span>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" @click="closeAddModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                    Cancel
                </button>
                <button type="button" @click="submitRequest" :disabled="saving"
                    class="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ saving ? 'Saving...' : 'Submit Request' }}
                </button>
            </div>
        </div>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">{{ viewingItem?.request_no || viewingItem?.name }}</h3>
                <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-600 transition">
                    <FeatherIcon type="x" size="20" />
                </button>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <p><span class="text-gray-500">Date Requested:</span> <span class="font-medium">{{ formatDate(viewingItem?.date_requested) }}</span></p>
                <p><span class="text-gray-500">Requested By:</span> <span class="font-medium">{{ viewingItem?.requested_by }}</span></p>
                <p><span class="text-gray-500">Supplier:</span> <span class="font-medium">{{ viewingItem?.supplier }}</span></p>
                <p><span class="text-gray-500">Status:</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass(viewingItem?.status)">
                        {{ viewingItem?.status }}
                    </span>
                </p>
                <p><span class="text-gray-500">Total Items:</span> <span class="font-medium">{{ viewingItem?.total_items }}</span></p>
                <p><span class="text-gray-500">Total Amount:</span>
                    <span class="font-medium">₱ {{ (viewingItem?.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                </p>
            </div>
        </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FeatherIcon type="trash-2" size="22" class="text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Delete this request?</h3>
                <p class="text-sm text-gray-600">
                    You're about to delete <span class="font-medium text-gray-700">"{{ itemToDelete?.request_no || itemToDelete?.name }}"</span>. This can't be undone.
                </p>
            </div>
            <div v-if="deleteError" class="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ deleteError }}
            </div>
            <div class="flex justify-end gap-4 mt-8">
                <button type="button" @click="closeDeleteModal"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition border border-gray-200 rounded-lg">
                    Cancel
                </button>
                <button type="button" @click="confirmDelete" :disabled="deleting"
                    class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import FeatherIcon from 'vue-feather'
import { useSidebar } from '../composables/useSidebar'
import StatCard from '../components/StatCard.vue'
import { currentUser, userResource } from '../data/user.js'
import { productList, fetchProducts } from '../data/product.js'
import { purchaseRequestList,
    purchaseRequestStats,
    fetchPurchaseRequests,
    reloadPurchaseRequests,
    addPurchaseRequests,
    updatePurchaseRequests,
    deletePurchaseRequests,
    generateRequestNo,
} from '../data/purchaseRequest.js'
import { useToast } from 'vue-toastification'

const { toggle } = useSidebar()
const toast = useToast()

/* LIFECYCLE */
onMounted(() => {
    userResource.fetch()
    fetchPurchaseRequests()
    fetchProducts()
    window.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
    window.removeEventListener('click', handleOutsideClick)
})

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)

const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const statusOptions = ['Pending', 'Approved', 'Rejected', 'Received']
const currentPage = ref(1)
const pageSize = ref(5)

const allRequests = computed(() => purchaseRequestList.data || [])

const filteredItems = computed(() => {
    let items = allRequests.value

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter((r) =>
            r.name?.toLowerCase().includes(q) ||
            r.request_no?.toLowerCase().includes(q) ||
            r.supplier?.toLowerCase().includes(q) ||
            r.requested_by?.toLowerCase().includes(q)
        )
    }

    if (statusFilter.value) {
        items = items.filter((r) => r.status === statusFilter.value)
    }

    if (dateFilter.value) {
        items = items.filter((r) => r.date_requested === dateFilter.value)
    }

    return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredItems.value.length))
const paginatedItems = computed(() => filteredItems.value.slice(startIndex.value, endIndex.value))


function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function statusBadgeClass(status) {
    switch (status) {
        case 'Pending': return 'bg-orange-100 text-orange-600'
        case 'Approved': return 'bg-green-100 text-green-600'
        case 'Received': return 'bg-violet-100 text-violet-600'
        case 'Rejected': return 'bg-red-100 text-red-600'
        default: return 'bg-gray-100 text-gray-600'
    }
}

/* ACTIONS DROPDOWN */
const activeMenu = ref(null)       // holds row.name of the row whose menu is open
const activeMenuRow = ref(null)    // holds the full row object
const menuBtnRefs = ref({})        // trigger button elements, keyed by row.name
const menuRef = ref(null)          // the teleported dropdown element
const menuPosition = reactive({ top: 0, left: 0 })

function setMenuBtnRef(el, name) {
    if (el) menuBtnRefs.value[name] = el
}

async function toggleActionsMenu(row) {
    if (activeMenu.value === row.name) {
        closeActionsMenu()
        return
    }
    activeMenu.value = row.name
    activeMenuRow.value = row

    await nextTick()
    const btn = menuBtnRefs.value[row.name]
    if (btn) {
        const rect = btn.getBoundingClientRect()
        menuPosition.top = rect.bottom + 4
        menuPosition.left = rect.right - 160 // 160px = w-40 dropdown width
    }
}

function closeActionsMenu() {
    activeMenu.value = null
    activeMenuRow.value = null
}

function handleOutsideClick(e) {
    if (!activeMenu.value) return
    const clickedTrigger = Object.values(menuBtnRefs.value).some((btn) => btn?.contains(e.target))
    const clickedMenu = menuRef.value?.contains?.(e.target)
    if (!clickedTrigger && !clickedMenu) closeActionsMenu()
}

async function changeStatus(row, newStatus) {
    closeActionsMenu()
    try {
        await updatePurchaseRequests(row.name, { status: newStatus })
        reloadPurchaseRequests()
        toast.success(`Request marked as ${newStatus}`)
    } catch (err) {
        console.error(err)
        toast.error('Failed to update status.')
    }
}

const showAddModal = ref(false)
const saving = ref(false)
const formError = ref('')
const search = ref('')

function emptyForm() {
    return {
        request_no: generateRequestNo(),
        date_requested: todayLocalStr(),
        requested_by: currentUser?.value?.username || currentUser?.value?.name || '',
        supplier: '',
        status: 'Pending',
        items: [],
    }
}

const form = reactive(emptyForm())

function todayLocalStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

function openAddModal() {
    formError.value = ''
    Object.assign(form, emptyForm())
    form.requested_by = currentUser?.value?.username || currentUser?.value?.name || ''
    showAddModal.value = true
}

function closeAddModal() {
    showAddModal.value = false
    search.value = ''
    formError.value = ''
}

const filteredProducts = computed(() => {
    const q = search.value.toLowerCase().trim()
    if (!q) return []
    return (productList.data || []).filter(
        (p) =>
            (p.product_name && p.product_name.toLowerCase().includes(q)) ||
            (p.item_code && p.item_code.toLowerCase().includes(q))
    )
})

function addItem(product) {
    const code = product.item_code || product.name
    const exists = form.items.find((item) => item.item_code === code)
    if (exists) {
        exists.quantity++
    } else {
        form.items.push({
            item: product.product_name,
            item_code: code,
            unit: product.unit,
            quantity: 1,
            unit_price: 0,
        })
    }
    search.value = ''
}

function removeItem(index) {
    form.items.splice(index, 1)
}

const summary = computed(() => ({
    totalItems: form.items.length,
    totalQuantity: form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
    totalAmount: form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0),
}))

async function submitRequest() {
    formError.value = ''

    if (!form.request_no || !form.date_requested || !form.supplier) {
        formError.value = 'Please fill in Request No, Date Requested and Supplier.'
        return
    }
    if (form.items.length === 0) {
        formError.value = 'Please add at least one item.'
        return
    }

    saving.value = true
    try {
        const payload = {
            request_no: form.request_no,
            date_requested: form.date_requested,
            requested_by: form.requested_by,
            supplier: form.supplier,
            status: form.status,
            total_items: summary.value.totalItems,
            total_quantity: summary.value.totalQuantity,
            total_amount: summary.value.totalAmount,
            items: form.items.map((i) => ({
                item_code: i.item_code,
                quantity: i.quantity,
                unit: i.unit,
                unit_price: i.unit_price,
                amount: (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
            })),
        }
        console.log('Sending this payload to Frappe:', payload)
        await addPurchaseRequests(payload)
        reloadPurchaseRequests()
        toast.success('Purchase request submitted!')
        closeAddModal()
    } catch (err) {
        console.error('Error saving purchase request:', err)
        formError.value = err?.message || 'Failed to save. Please try again.'
    } finally {
        saving.value = false
    }
}


const showViewModal = ref(false)
const viewingItem = ref(null)

function openViewModal(row) {
    closeActionsMenu()
    viewingItem.value = row
    showViewModal.value = true
}

const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function openDeleteModal(row) {
    closeActionsMenu()
    itemToDelete.value = row
    deleteError.value = ''
    showDeleteModal.value = true
}

function closeDeleteModal() {
    if (deleting.value) return
    showDeleteModal.value = false
    itemToDelete.value = null
    deleteError.value = ''
}

async function confirmDelete() {
    if (!itemToDelete.value) return
    deleting.value = true
    deleteError.value = ''
    try {
        await deletePurchaseRequests(itemToDelete.value.name)
        reloadPurchaseRequests()
        toast.success('Purchase request deleted.')
        showDeleteModal.value = false
        itemToDelete.value = null
    } catch (err) {
        console.error(err)
        deleteError.value = err?.message || 'Failed to delete. Please try again.'
    } finally {
        deleting.value = false
    }
}
</script>