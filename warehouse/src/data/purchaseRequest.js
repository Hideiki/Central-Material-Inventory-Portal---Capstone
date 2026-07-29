import { createListResource } from 'frappe-ui'
import { computed } from 'vue'

export const purchaseRequestList = createListResource({
    doctype: 'Purchase Request',
    fields: [
        'name',
        'request_no',
        'date_requested',
        'requested_by',
        'supplier',
        'status',
        'total_items',
        'total_quantity',
        'total_amount',
        'creation',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true, 
})


export const purchaseRequestStats = computed(() => {
    const data = purchaseRequestList.data || []

    return {
        totalRequests: data.length,
        pending: data.filter((r) => r.status === 'Pending').length,
        approved: data.filter((r) => r.status === 'Approved').length,
        received: data.filter((r) => r.status === 'Received').length,
    }
})


export function fetchPurchaseRequests() {
    purchaseRequestList.fetch()
}


export function reloadPurchaseRequests() {
    purchaseRequestList.reload()
}


export function addPurchaseRequests(values) {
    return purchaseRequestList.insert.submit(values)
}


export function updatePurchaseRequests(name, values) {
    return purchaseRequestList.setValue.submit({ name, ...values })
}

// Nagde-delete ng record base sa `name`
export function deletePurchaseRequests(name) {
    return purchaseRequestList.delete.submit(name)
}


export function generateRequestNo() {
    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    return `PR-${year}-${random}`
}