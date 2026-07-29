import { createListResource } from 'frappe-ui'
import { computed } from 'vue'

export const productList = createListResource({
    doctype: 'Product',
    fields: [
        'name',
        'item_code',
        'product_name',
        'sku',
        'category',
        'unit',
        'current_stock',
        'reorder_level',
        'status',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true,
})

export const productStats = computed(() => {
    const data = productList.data || []

    return {
        totalItems: data.length,
        totalQuantity: data.reduce((sum, p) => sum + (p.current_stock || 0), 0),
        lowStock: data.filter((p) => p.status === 'Low Stock').length,
        outOfStock: data.filter((p) => p.status === 'Out of Stock').length,
    }
})

export function fetchProducts() {
    productList.fetch()
}

export function reloadProducts() {
    productList.reload()
}

/* CRUD */
export function addProduct(values) {
    return productList.insert.submit(values)
}

export function updateProduct(name, values) {
    return productList.setValue.submit({ name, ...values })
}

export function deleteProduct(name) {
    return productList.delete.submit(name)
}