import { createListResource } from 'frappe-ui'
import { computed } from 'vue'

export const stockReceivingList = createListResource({
    doctype: 'Stock Receiving',
    fields: [
        'name',
        'reference_no',
        'date_received',
        'supplier',
        'po_no',
        'received_by',
        'total_items',
        'total_quantity',
        'total_amount',
        'creation',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true,
})

function todayStr() {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

export const receivingStats = computed(() => {
    const data = stockReceivingList.data || []
    const today = todayStr()
    const todaysRecords = data.filter((r) => r.date_received === today)

    const rawTotalValue = todaysRecords.reduce((sum, r) => sum + (r.total_amount || 0), 0)

    return {
        todayReceipts: todaysRecords.length,
        totalItemsReceived: todaysRecords.reduce((sum, r) => sum + (r.total_items || 0), 0),
        totalQuantityReceived: todaysRecords.reduce((sum, r) => sum + (r.total_quantity || 0), 0),
        totalStockValue: `₱ ${rawTotalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }
})

export function fetchStockReceivings() {
    stockReceivingList.fetch()
}

export function reloadStockReceivings() {
    stockReceivingList.reload()
}

export function saveStockReceiving(values) {
    return stockReceivingList.insert.submit(values)
}