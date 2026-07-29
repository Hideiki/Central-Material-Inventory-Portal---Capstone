<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between no-print">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition">
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">Reports</h2>
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

        <div class="flex justify-between no-print">
            <div class="flex items-center">
                <p class="text-sm text-gray-600 font-medium">
                    Generate and export inventory reports for monitoring and decision-making
                </p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-300 shadow-sm">
                    <FeatherIcon type="calendar" class="w-4 h-4" />
                    {{ formattedDate }}
                </div>
            </div>
        </div>

        <!-- REPORT CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 no-print">
            <ReportCard icon="package" icon-bg="bg-blue-500" label="Inventory Report"
            caption="View current stock levels of all items"
            button-color="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition"
            @view="selectReportType('Inventory Report')" />
            <ReportCard icon="truck" icon-bg="bg-green-500" label="Materials Receiving Report"
            caption="List of all received materials"
            button-color="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
            @view="selectReportType('Materials Receiving Report')" />
            <ReportCard icon="upload" icon-bg="bg-red-500" label="Stock Out / Withdrawal Report"
            caption="Record of released or withdrawn materials"
            button-color="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
            @view="selectReportType('Stock Out / Withdrawal Report')" />
            <ReportCard icon="file-text" icon-bg="bg-orange-500" label="Purchase Request Report"
            caption="View all purchase requests made"
            button-color="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition"
            @view="selectReportType('Purchase Request Report')" />
            <ReportCard icon="rotate-ccw" icon-bg="bg-violet-500" label="Return Report"
            caption="View returned materials and reasons"
            button-color="border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white transition"
            @view="selectReportType('Return Report')" />
            <ReportCard icon="alert-triangle" icon-bg="bg-gray-700" label="Low Stock Report"
            caption="Displays items below the reorder level"
            button-color="border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition"
            @view="selectReportType('Low Stock Report')" />
        </div>

        <!-- FILTER BAR -->
        <div class="bg-white border border-gray-300 shadow-sm rounded-2xl p-5 no-print">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Date From</p>
                    <input type="date" v-model="dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    focus:outline-none focus:ring-1 focus:ring-blue-500">
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Date To</p>
                    <input type="date" v-model="dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    focus:outline-none focus:ring-1 focus:ring-blue-500">
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Report Type</p>
                    <select v-model="selectedReportType" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="">All Reports</option>
                        <option v-for="type in Object.keys(REPORT_CONFIG)" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Category</p>
                    <select v-model="categoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                        <option value="">All Categories</option>
                        <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700 mb-1">Search</p>
                    <div class="relative">
                        <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" v-model="searchQuery" placeholder="Search report..." class="w-full pl-9 px-3 py-2
                        border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    </div>
                </div>
            </div>
            <div class="flex justify-end mt-4">
                <button @click="generateReport" :disabled="generating" class="bg-blue-700 hover:bg-blue-600 text-white px-5 py-2.5
                rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-60">
                    <FeatherIcon type="filter" size="16" />
                    {{ generating ? 'Generating...' : 'Generate Report' }}
                </button>
            </div>
        </div>

        <!-- REPORT PREVIEW -->
        <div v-if="showPreview" id="printable-report" class="bg-white border border-gray-300 shadow-sm rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between no-print">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ selectedReportType }}</h3>
                    <p class="text-sm text-gray-500">{{ reportRows.length }} record(s) found</p>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="exportCSV" class="border border-green-500 text-green-600 hover:bg-green-600 hover:text-white px-4 py-2 
                    rounded-md text-sm font-medium flex items-center gap-2 transition">
                        <FeatherIcon type="file-text" size="16" />
                        Export to Excel
                    </button>
                    <button @click="printReport" class="border border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md
                    text-sm font-medium flex items-center gap-2 transition">
                        <FeatherIcon type="download" size="16" />
                        Export to PDF
                    </button>
                    <button @click="printReport" class="border border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white px-4 py-2 rounded-md
                    text-sm font-medium flex items-center gap-2 transition">
                        <FeatherIcon type="printer" size="16" />
                        Print Report
                    </button>
                </div>
            </div>

            <!-- PRINT ONLY HEADING -->
            <div class="hidden print:block mb-4">
                <h2 class="text-xl font-bold text-gray-900">{{ selectedReportType }}</h2>
                <p class="text-sm text-gray-500">Generated on {{ formattedDate }}</p>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th v-for="col in currentColumns" :key="col.key" class="px-4 py-3">{{ col.label }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="reportRows.length === 0">
                            <td :colspan="currentColumns.length" class="px-4 py-10 text-center text-gray-400">
                                No records match the selected filters.
                            </td>
                        </tr>
                        <tr v-for="(row, i) in reportRows" :key="i" class="border-b border-gray-100 hover:bg-gray-50/50">
                            <td v-for="col in currentColumns" :key="col.key" class="px-4 py-3 text-gray-700">
                                <span v-if="col.badge" class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                :class="getStatusBadgeClass(row[col.key])">
                                    {{ row[col.key] }}
                                </span>
                                <template v-else>{{ col.money ? formatMoney(row[col.key]) : row[col.key] }}</template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- GENERATED REPORTS LOG -->
        <div class="bg-white border border-gray-300 shadow-sm rounded-2xl p-6 no-print">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FeatherIcon type="file-text" size="18" />
                    Generated Reports
                </h3>
            </div>
            <div class="border border-gray-200 rounded-lg overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Report Type</th>
                            <th class="px-4 py-3">Reference No.</th>
                            <th class="px-4 py-3">Prepared By</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!reportLogList.data || reportLogList.data.length === 0">
                            <td colspan="6" class="px-4 py-10 text-center text-gray-400">
                                No reports generated yet.
                            </td>
                        </tr>
                        <tr v-for="log in reportLogList.data" :key="log.name"
                            class="border-b border-gray-100 hover:bg-gray-50/50 transition"
                            :class="isViewingLog(log) ? 'bg-blue-50/70' : ''">
                            <td class="px-4 py-3 text-gray-600">{{ formatLogDate(log.creation) }}</td>
                            <td class="px-4 py-3 text-gray-800">{{ log.report_type }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ log.reference_no }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ log.prepared_by }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                :class="log.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                    {{ log.status }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="toggleViewLog(log)" class="text-blue-600 hover:text-blue-800 transition"
                                        :title="isViewingLog(log) ? 'Hide' : 'View'">
                                        <FeatherIcon :type="isViewingLog(log) ? 'eye-off' : 'eye'" size="16" />
                                    </button>
                                    <button @click="downloadLog(log)" class="text-green-600 hover:text-green-800 transition" title="Download">
                                        <FeatherIcon type="download" size="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useSidebar } from '../composables/useSidebar'
import { currentUser } from '../data/user'
import FeatherIcon from 'vue-feather'
import ReportCard from '../components/ReportCard.vue'
import { useToast } from 'vue-toastification'
import { productList, fetchProducts } from '../data/product'
import { stockReceivingList, fetchStockReceivings } from '../data/stockReceiving'
import { stockWithdrawalList, fetchStockWithdrawal } from '../data/stockWithdrawal'
import { materialReturnList, fetchMaterialReturns } from '../data/returns'
import { reportLogList, fetchReportLogs, reloadReportLogs, saveReportLog } from '../data/reports'
import { purchaseRequestList, fetchPurchaseRequests } from '../data/purchaseRequest'

const { toggle } = useSidebar()
const toast = useToast()

onMounted(() => {
    fetchProducts()
    fetchStockReceivings()
    fetchStockWithdrawal()
    fetchMaterialReturns()
    fetchReportLogs()
    fetchPurchaseRequests()
})

const REPORT_CONFIG = {
    'Inventory Report': {
        dateField: null,
        getData: () => productList.data || [],
        columns: [
            { key: 'item_code', label: 'Item Code' },
            { key: 'product_name', label: 'Product Name' },
            { key: 'category', label: 'Category' },
            { key: 'unit', label: 'Unit' },
            { key: 'current_stock', label: 'Current Stock' },
            { key: 'reorder_level', label: 'Reorder Level' },
            { key: 'status', label: 'Status', badge: true },
        ],
    },
    'Materials Receiving Report': {
        dateField: 'date_received',
        getData: () => stockReceivingList.data || [],
        columns: [
            { key: 'reference_no', label: 'Reference No' },
            { key: 'date_received', label: 'Date Received' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'po_no', label: 'PO No' },
            { key: 'received_by', label: 'Received By' },
            { key: 'total_items', label: 'Total Items' },
            { key: 'total_quantity', label: 'Total Quantity' },
            { key: 'total_amount', label: 'Total Amount', money: true },
        ],
    },
    'Stock Out / Withdrawal Report': {
        dateField: 'date_issued',
        getData: () => stockWithdrawalList.data || [],
        columns: [
            { key: 'reference_no', label: 'Reference No' },
            { key: 'date_issued', label: 'Date Issued' },
            { key: 'requested_by', label: 'Requested By' },
            { key: 'department_to', label: 'Department / To' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'total_items', label: 'Total Items' },
            { key: 'total_quantity', label: 'Total Quantity' },
            { key: 'total_amount', label: 'Total Amount', money: true },
        ],
    },
    'Purchase Request Report': {
        dateField: 'date_requested',
        getData: () => purchaseRequestList.data || [],
        columns: [
            { key: 'request_no', label: 'Request No' },
            { key: 'date_requested', label: 'Date Requested' },
            { key: 'requested_by', label: 'Requested By' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'total_items', label: 'Total Items' },
            { key: 'total_amount', label: 'Total Amount', money: true },
            { key: 'status', label: 'Status', badge: true },
        ],
    },
    'Return Report': {
        dateField: 'date_return',
        getData: () => materialReturnList.data || [],
        columns: [
            { key: 'return_no', label: 'Return No' },
            { key: 'date_return', label: 'Date' },
            { key: 'returned_to', label: 'Returned To' },
            { key: 'requested_by', label: 'Requested By' },
            { key: 'received_by', label: 'Received By' },
            { key: 'return_reason', label: 'Reason' },
            { key: 'return_status', label: 'Status', badge: true },
            { key: 'total_amount', label: 'Total Amount', money: true },
        ],
    },
    'Low Stock Report': {
        dateField: null,
        getData: () => (productList.data || []).filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock'),
        columns: [
            { key: 'item_code', label: 'Item Code' },
            { key: 'product_name', label: 'Product Name' },
            { key: 'current_stock', label: 'Current Stock' },
            { key: 'reorder_level', label: 'Reorder Level' },
            { key: 'status', label: 'Status', badge: true },
        ],
    },
}

const PREFIX_MAP = {
    'Inventory Report': 'INV',
    'Materials Receiving Report': 'MRR',
    'Stock Out / Withdrawal Report': 'SOR',
    'Purchase Request Report': 'PRR',
    'Return Report': 'RTR',
    'Low Stock Report': 'LSR',
}

const dateFrom = ref('')
const dateTo = ref('')
const selectedReportType = ref('')
const categoryFilter = ref('')
const searchQuery = ref('')
const generating = ref(false)
const showPreview = ref(false)
const activeLogName = ref(null)

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)

const currentColumns = computed(() => REPORT_CONFIG[selectedReportType.value]?.columns || [])

const categoryOptions = computed(() => {
    const cats = (productList.data || []).map((p) => p.category).filter(Boolean)
    return [...new Set(cats)]
})

const reportRows = computed(() => {
    const config = REPORT_CONFIG[selectedReportType.value]
    if (!config) return []

    let rows = config.getData()

    if (config.dateField && (dateFrom.value || dateTo.value)) {
        rows = rows.filter((r) => {
            const d = r[config.dateField]
            if (!d) return false
            if (dateFrom.value && d < dateFrom.value) return false
            if (dateTo.value && d > dateTo.value) return false
            return true
        })
    }

    if (categoryFilter.value) {
        rows = rows.filter((r) => r.category === categoryFilter.value)
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        rows = rows.filter((r) =>
            Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
        )
    }

    return rows
})

function selectReportType(type) {
    selectedReportType.value = type
    activeLogName.value = null 
    showPreview.value = true
}

function formatMoney(value) {
    return `₱ ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function getStatusBadgeClass(value) {
    const positive = ['In Stock', 'Approved', 'Completed', 'Received']
    const warning = ['Low Stock', 'Pending']
    const negative = ['Out of Stock', 'Rejected', 'Failed']

    if (positive.includes(value)) return 'bg-green-100 text-green-700'
    if (warning.includes(value)) return 'bg-orange-100 text-orange-700'
    if (negative.includes(value)) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
}

function formatLogDate(dt) {
    if (!dt) return ''
    return new Date(dt).toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
}

function generateReferenceNo(type) {
    const prefix = PREFIX_MAP[type] || 'RPT'
    const stamp = Date.now().toString().slice(-6)
    return `${prefix}-${stamp}`
}

async function generateReport() {
    if (!selectedReportType.value) {
        toast.error('Please select a report type first.')
        return
    }

    if (reportRows.value.length === 0) {
        showPreview.value = true
        activeLogName.value = null
        toast.error('No records found for this report. Nothing was saved to the log')
        return
    }

    generating.value = true
    try {
        await saveReportLog({
            reference_no: generateReferenceNo(selectedReportType.value),
            report_type: selectedReportType.value,
            date_from: dateFrom.value || null,
            date_to: dateTo.value || null,
            category: categoryFilter.value || '',
            prepared_by: currentUser.value?.name || currentUser.value?.username || '',
            status: 'Completed',
        })
        reloadReportLogs()
        activeLogName.value = null
        showPreview.value = true
        toast.success('Report generated successfully!')
    } catch (err) {
        console.error('Error generating report:', err)
        const message = err.messages?.[0] || err.message || 'Failed to generate report.'
        toast.error(message)
    } finally {
        generating.value = false
    }
}

function isViewingLog(log) {
    return showPreview.value && activeLogName.value === log.name
}

async function toggleViewLog(log) {
    if (isViewingLog(log)) {
        showPreview.value = false
        activeLogName.value = null
        return
    }

    selectedReportType.value = log.report_type
    dateFrom.value = log.date_from || ''
    dateTo.value = log.date_to || ''
    categoryFilter.value = log.category || ''
    activeLogName.value = log.name
    showPreview.value = true

    await nextTick()
    document.getElementById('printable-report')?.scrollIntoView({ behavior: 'smooth' })
}

async function downloadLog(log) {
    selectedReportType.value = log.report_type
    dateFrom.value = log.date_from || ''
    dateTo.value = log.date_to || ''
    categoryFilter.value = log.category || ''
    activeLogName.value = log.name
    showPreview.value = true

    await nextTick()
    exportCSV()
}

function exportCSV() {
    const config = REPORT_CONFIG[selectedReportType.value]
    if (!config || reportRows.value.length === 0) {
        toast.error('No data to export.')
        return
    }

    const headers = config.columns.map((c) => c.label)
    const rows = reportRows.value.map((row) =>
        config.columns
            .map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`)
            .join(',')
    )
    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedReportType.value.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

function printReport() {
    window.print()
}
</script>

<style>

@media print {
    body * {
        visibility: hidden;
    }
    #printable-report,
    #printable-report * {
        visibility: visible;
    }
    #printable-report {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    .no-print {
        display: none !important;
    }
}
</style>