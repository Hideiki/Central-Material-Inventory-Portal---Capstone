import { createListResource } from "frappe-ui";
import { computed } from "vue";
import { stockReceivingList } from "./stockReceiving";

export const supplierList = createListResource({
    doctype: 'Supplier',
    fields: [
        'name',
        'supplier_id',
        'supplier_name',
        'contact_person',
        'phone',
        'email',
        'status',
        'address',
        'creation'
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true
})

export const supplierStats = computed(() => {
    const data = supplierList.data || []

    return {
        totalSuppliers: data.length,
        active: data.filter(a => a.status === 'Active').length,
        inactive: data.filter(i => i.status === 'Inactive').length,
        totalTransactions: (stockReceivingList.data || []).length,
    }
})

export function fetchSuppliers() {
    supplierList.fetch()
}

export function reloadSuppliers() {
    supplierList.reload()
}

export function addSupplier(values) {
    return supplierList.insert.submit(values)
}

export function updateSupplier(name, values) {
    return supplierList.setValue.submit({ name, ...values })
}

export function deleteSupplier(name) {
    return supplierList.delete.submit(name)
}