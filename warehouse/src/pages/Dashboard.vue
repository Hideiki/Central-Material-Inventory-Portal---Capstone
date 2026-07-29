<template>
    <div class="min-h-screen flex-1 bg-white p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600">
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
                    <p class="text-sm text-gray-500">Welcome back, {{ currentUser?.username || 'User' }}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FeatherIcon type="user" class="text-blue-700" />
                    </div>
                    <div class="text-sm leading-tight">
                        <p class="font-semibold text-base text-gray-800">{{ currentUser?.username || 'User' }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-end">
            <div class="flex items-center gap-2 bg-white/30 rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" size="15" />
                {{ formattedDate }}
            </div>
        </div>

        <!-- ERROR STATE -->
        <div v-if="productList.error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            Failed to load products: {{ productList.error.message || productList.error }}
        </div>

        <!-- STATS CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="box" icon-bg="bg-blue-100" icon-color="text-blue-600" label="Total Items"
            :value="productStats.totalItems" caption="All items in inventory" />
            <StatCard icon="package" icon-bg="bg-green-200" icon-color="text-green-600" label="Total Stock Quantity"
            :value="productStats.totalQuantity" caption="All items quantity" />
            <StatCard icon="alert-triangle" icon-bg="bg-orange-100" icon-color="text-orange-600" label="Low Stock Items"
            :value="productStats.lowStock" caption="Need to reorder" />
            <StatCard icon="x-circle" icon-bg="bg-red-100" icon-color="text-red-600" label="Out of Stock Items"
            :value="productStats.outOfStock" caption="No available stock" />
        </div>

        <!-- STOCK OVERVIEW + RECENT TRANSACTIONS-->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- STOCK OVERVIEW -->
            <div class="bg-white rounded-2xl border border-gray-300 shadow-md p-5">
                <h2 class="font-semibold text-gray-800 mb-3">Stock Overview</h2>
                <div class="divide-y divide-gray-100">
                    <div class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <FeatherIcon type="layers" class="text-blue-600" />
                            </div>
                            <span class="font-semibold text-gray-600">Remaining Stock</span>
                        </div>
                        <span class="font-semibold text-gray-800 text-xl">{{ productStats.totalQuantity }}</span>
                    </div>
                    <div class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                                <FeatherIcon type="alert-triangle" class="text-orange-600" />
                            </div>
                            <span class="font-semibold text-gray-600">Low Stock Items</span>
                        </div>
                        <span class="font-semibold text-gray-800 text-xl">{{ productStats.lowStock }}</span>
                    </div>
                    <div class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                                <FeatherIcon type="x-circle" class="text-red-600" />
                            </div>
                            <span class="font-semibold text-gray-600">Out of Stock Items</span>
                        </div>
                        <span class="font-semibold text-gray-800 text-xl">{{ productStats.outOfStock }}</span>
                    </div>
                </div>
            </div>

            <!-- RECENT TRANSACTIONS -->
            <div class="bg-white rounded-2xl border border-gray-300 shadow-md p-5">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="font-semibold text-gray-800">Recent Transactions</h2>
                    <RouterLink to="/stock-in" class="text-sm text-blue-600 hover:underline">
                        View All
                    </RouterLink>
                </div>

                <!-- EMPTY STATE -->
                <div v-if="recentTransactions.length === 0" class="text-center py-10 text-gray-400 text-sm">
                    <FeatherIcon type="inbox" class="mx-auto mb-2" size="24" />
                    No transactions yet.<br />
                    Stock In and Stock Out records will appear here.
                </div>

                <!-- LIST OF TRANSACTIONS -->
                <div v-else class="divide-y divide-gray-100">
                    <div v-for="txn in recentTransactions" :key="txn.key" class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            :class="txn.type === 'Stock In' ? 'bg-green-100' : 'bg-red-100'">
                                <FeatherIcon :type="txn.type === 'Stock In' ? 'arrow-down' : 'arrow-up'" size="20"
                                :class="txn.type === 'Stock In' ? 'text-green-600' : 'text-red-600'"/>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800 text-sm">{{ txn.type }}</p>
                                <p class="text-xs text-gray-500">{{ txn.description }}</p>
                            </div>
                        </div>
                        <span class="text-xs text-gray-500 shrink-0">{{ formatTxnDate(txn.date) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="productList.loading" class="text-center py-8">
            <p class="text-gray-500">Loading products...</p>
        </div>

        <!-- LOW STOCK ITEM TABLE -->
        <div v-else class="bg-white rounded-2xl border border-gray-300 shadow-md p-5">
            <div class="flex items-center justify-between mb-3">
                <h2 class="font-semibold text-gray-800">Low Stock Items</h2>
                <RouterLink to="/inventory" class="text-sm text-blue-600 hover:underline">
                    View All
                </RouterLink>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-500 border-b border-gray-300">
                        <th class="font-medium py-2">Item Code</th>
                        <th class="font-medium py-2">Item Name</th>
                        <th class="font-medium py-2">Current Stock</th>
                        <th class="font-medium py-2">Reorder Level</th>
                        <th class="font-medium py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in lowStockItems" :key="item.name" class="border-b border-gray-50 last:border-0">
                        <td class="py-3 text-gray-600">{{ item.item_code || item.name }}</td>
                        <td class="py-3 text-gray-800">{{ item.product_name }}</td>
                        <td class="py-3 text-gray-600">{{ item.current_stock }}</td>
                        <td class="py-3 text-gray-800">{{ item.reorder_level }}</td>
                        <td class="py-3">
                            <span class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                :class="item.status === 'Out of Stock' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'">
                                {{ item.status }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="lowStockItems.length === 0">
                        <td colspan="5" class="py-8 text-center text-gray-400">
                            Nothing low on stock right now — good shape!
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import FeatherIcon from 'vue-feather'
import StatCard from '../components/StatCard.vue'
import { userResource, currentUser } from '../data/user.js'
import { productList, productStats, fetchProducts } from '../data/product.js'
import { computed, onMounted } from 'vue'
import { useSidebar } from '../composables/useSidebar.js'
// BAGO: kunin natin yung stock in/out lists para sa Recent Transactions
import { stockReceivingList, fetchStockReceivings } from '../data/stockReceiving.js'
import { stockWithdrawalList, fetchStockWithdrawal } from '../data/stockWithdrawal.js'

onMounted(() => {
    userResource.fetch()
    fetchProducts()
    fetchStockReceivings() 
    fetchStockWithdrawal()  
})

const { toggle } = useSidebar()

const lowStockItems = computed(() => {
    const data = productList.data || []
    return data
        .filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
        .sort((a, b) => (a.current_stock ?? 0) - (b.current_stock ?? 0))
        .slice(0, 5)
})

const recentTransactions = computed(() => {
    const stockIns = (stockReceivingList.data || []).map((r) => ({
        key: `in-${r.name}`,
        type: 'Stock In',
        date: r.date_received,
        creation: r.creation,
        description: r.supplier || r.reference_no || '-',
        reference: r.reference_no,
    }))

    const stockOuts = (stockWithdrawalList.data || []).map((r) => ({
        key: `out-${r.name}`,
        type: 'Stock Out',
        date: r.date_issued,
        creation: r.creation,
        description: r.department_to || r.reference_no || '-',
        reference: r.reference_no,
    }))

    return [...stockIns, ...stockOuts]
        .sort((a, b) => new Date(b.creation) - new Date(a.creation))
        .slice(0, 5)
})

function formatTxnDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
)
</script>