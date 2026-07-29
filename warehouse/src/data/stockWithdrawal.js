import { computed } from "vue"
import { createListResource } from "frappe-ui"

export const stockWithdrawalList = createListResource({
    doctype: 'Stock Withdrawal',
    fields: [
        'name',
        'reference_no',
        'date_issued',
        'requested_by',
        'department_to',
        'purpose',
        'notes',
        'total_items',
        'total_quantity',
        'total_amount',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true
})

function todayStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

export const withdrawalStats = computed(() => {
    const data = stockWithdrawalList.data || []
    const today = todayStr()
    const todayRecords = data.filter(r => r.date_issued === today)

    const rawTotalValue = todayRecords.reduce((sum, r) => sum + (r.total_amount || 0), 0)
    
    return {
        todayIssues: todayRecords.length,
        totalItemsIssued: todayRecords.reduce((sum, r) => sum + (r.total_items || 0), 0),
        totalQuantityIssued: todayRecords.reduce((sum, r) => sum + (r.total_quantity || 0), 0),
        totalStockValueIssued: `₱ ${rawTotalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }
})

export function fetchStockWithdrawal() {
    stockWithdrawalList.fetch()
}

export function reloadStockWithdrawal() {
    stockWithdrawalList.reload()
}

export function saveStockWithdrawal(values) {
    return stockWithdrawalList.insert.submit(values)
}