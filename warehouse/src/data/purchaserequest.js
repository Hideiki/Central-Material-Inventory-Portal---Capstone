import { createListResource } from "frappe-ui";
import { computed } from "vue";

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
        'creation'
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true
})

export const purchaseRequestStats = computed(() => {
    const data = purchaseRequestList.data || []

    return {
        totalRequests: data.length,
        pending: data.filter(r => r.status === 'Pending').length,
        approved: data.filter(r => r.status === 'Approved').length,
        received: data.filter(r => r.status === 'Received').length
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

export function deletePurchaseRequests(name) {
    return purchaseRequestList.delete.submit(name)
}

// Simple auto-generator para sa Request No, e.g. PR-20260724-143205
export function generateRequestNo() {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const stamp = `${d.getFullYear()}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    return `PR-${stamp}`
}