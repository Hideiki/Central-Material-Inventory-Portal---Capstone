import { createListResource } from 'frappe-ui'

export const materialReturnList = createListResource({
    doctype: 'Material Return',
    fields: [
        'name',
        'return_no',
        'date_return',
        'returned_to',
        'reference_type',
        'reference_no',
        'requested_by',
        'received_by',
        'department_section',
        'return_status',
        'return_reason',
        'remarks',
        'total_amount',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true,
})

export function fetchMaterialReturns() {
    materialReturnList.fetch()
}

export function reloadMaterialReturns() {
    materialReturnList.reload()
}

export function saveMaterialReturn(values) {
    return materialReturnList.insert.submit(values)
}