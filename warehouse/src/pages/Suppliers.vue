<template>
    <div class="min-h-screen flex-1 p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition" >
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">
                        Suppliers
                    </h2>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FeatherIcon type="user" class="text-blue-700" />
                    </div>
                    <div class="text-sm leading-tight">
                        <p class="font-semibold text-base text-gray-800">
                            {{ currentUser.username || 'User' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between">
            <div class="flex items-center">
                <p class="text-sm text-gray-600 font-medium">
                    Manage and maintain the list of suppliers in the system
                </p>
            </div>
            <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" class="w-4 h-4" />
                {{ formattedDate }}
            </div>
        </div>
        <!-- ERROR STATE -->
        <div v-if="supplierList.error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            Failed to load suppliers: {{ supplierList.error.message || supplierList.error }}
        </div>
        <!-- STAT CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="users" icon-bg="bg-blue-200" icon-color="text-blue-600" label="Total Suppliers"
            :value="supplierStats.totalSuppliers" caption="All suppliers" />
            <StatCard icon="check" icon-bg="bg-green-200" icon-color="text-green-600" label="Active suppliers"
            :value="supplierStats.active" caption="Currently active" />
            <StatCard icon="cloud-off" icon-bg="bg-orange-200" icon-color="text-orange-600" label="Inactive suppliers"
            :value="supplierStats.inactive" caption="Currently inactive" />
            <StatCard icon="package" icon-bg="bg-violet-200" icon-color="text-violet-600" label="Total transactions"
            :value="supplierStats.totalTransactions" caption="All time" />
        </div>
        <!-- LOADING STATE -->
        <div v-if="supplierList.loading" class="text-center py-8">
            <p class="text-gray-500">Loading suppliers...</p>
        </div>
        <!-- SUPPLIER LIST -->
        <div v-else class="border border-gray-300 rounded-2xl shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-800">Supplier List</h3>
                <div class="flex items-center gap-3">
                    <button @click="openAddModal" class="px-3 py-2 bg-blue-700 text-white flex items-center gap-2 text-sm
                    rounded-lg hover:bg-blue-600 transition">
                        <FeatherIcon type="plus" size="16" />
                        Add Supplier
                    </button>
                    <div class="relative">
                        <input
                            v-model="searchQuery"
                            type="text"
                            class="w-56 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none
                            focus:ring-1 focus:ring-blue-500"
                            placeholder="Search supplier"
                        />
                        <FeatherIcon type="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>
            <!-- TABLE -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs">
                        <tr>
                            <th class="p-4 text-left font-semibold">Supplier ID</th>
                            <th class="p-4 text-left font-semibold">Supplier Name</th>
                            <th class="p-4 text-left font-semibold">Contact Person</th>
                            <th class="p-4 text-left font-semibold">Phone</th>
                            <th class="p-4 text-left font-semibold">Email</th>
                            <th class="p-4 text-left font-semibold">Status</th>
                            <th class="p-4 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in paginatedSuppliers" :key="row.name" class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="p-4 font-medium text-gray-800">{{ row.supplier_id }}</td>
                            <td class="p-4 text-gray-600">{{ row.supplier_name }}</td>
                            <td class="p-4 text-gray-600">{{ row.contact_person }}</td>
                            <td class="p-4 text-gray-600">{{ row.phone }}</td>
                            <td class="p-4 text-gray-600">{{ row.email }}</td>
                            <td class="p-4">
                                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" :class="statusBadgeClass(row.status)">
                                    {{ row.status }}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="openEditModal(row)" title="Edit"
                                        class="w-8 h-8 flex items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                                        <FeatherIcon type="edit-2" size="14" />
                                    </button>
                                    <button @click="openDeleteModal(row)" title="Delete"
                                        class="w-8 h-8 flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition">
                                        <FeatherIcon type="trash-2" size="14" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredSuppliers.length === 0">
                            <td colspan="7" class="p-8 text-center text-gray-500">
                                No suppliers found. Try adjusting your search.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- PAGINATION -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                    Showing {{ filteredSuppliers.length === 0 ? 0 : startIndex + 1 }} to {{ endIndex }} of {{ filteredSuppliers.length }} entries
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
    <!-- ADD / EDIT MODAL -->
    <div v-if="showSupplierModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">
                    {{ isEditing ? 'Edit Supplier' : 'Add Supplier' }}
                </h3>
                <button @click="closeSupplierModal" class="text-gray-400 hover:text-gray-600 transition">
                    <FeatherIcon type="x" size="20" />
                </button>
            </div>

            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ formError }}
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Supplier ID <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.supplier_id" :disabled="isEditing" placeholder="e.g. SUP-006"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-70" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.supplier_name" placeholder="Enter supplier name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input type="text" v-model="form.contact_person" placeholder="Enter contact person"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="text" v-model="form.phone" placeholder="e.g. 0917 123 4567"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" v-model="form.email" placeholder="e.g. supplier@gmail.com"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea v-model="form.address" rows="2" placeholder="Enter address"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="form.status"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                <button type="button" @click="closeSupplierModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                    Cancel
                </button>
                <button type="button" @click="submitSupplier" :disabled="saving"
                    class="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Supplier') }}
                </button>
            </div>
        </div>
    </div>
    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FeatherIcon type="trash-2" size="22" class="text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Delete this supplier?</h3>
                <p class="text-sm text-gray-600">
                    You're about to delete <span class="font-medium text-gray-700">"{{ supplierToDelete?.supplier_name }}"</span>. This can't be undone.
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
import { useToast } from 'vue-toastification';
import { useSidebar } from '../composables/useSidebar';
import { currentUser } from '../data/user';
import FeatherIcon from 'vue-feather'
import { computed, reactive, ref, onMounted } from 'vue';
import StatCard from '../components/StatCard.vue';
import {
    supplierList,
    supplierStats,
    fetchSuppliers,
    reloadSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
} from '../data/supplier.js';

const { toggle } = useSidebar()
const toast = useToast()

/* LIFECYCLE */
onMounted(() => {
    fetchSuppliers()
})

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })
)

/* SEARCH + PAGINATION */
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)

const allSuppliers = computed(() => supplierList.data || [])

const filteredSuppliers = computed(() => {
    let items = allSuppliers.value
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter((s) =>
            s.supplier_id?.toLowerCase().includes(q) ||
            s.supplier_name?.toLowerCase().includes(q) ||
            s.contact_person?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q)
        )
    }
    return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSuppliers.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredSuppliers.value.length))
const paginatedSuppliers = computed(() => filteredSuppliers.value.slice(startIndex.value, endIndex.value))

function statusBadgeClass(status) {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-600'
        case 'Inactive': return 'bg-red-100 text-red-600'
        default: return 'bg-gray-100 text-gray-600'
    }
}

/* ADD / EDIT MODAL */
const showSupplierModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formError = ref('')
const editingName = ref(null) // holds the Frappe "name" (doc id) of the record being edited

function emptyForm() {
    return {
        supplier_id: '',
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        status: 'Active',
    }
}

const form = reactive(emptyForm())

function nextSupplierId() {
    const count = allSuppliers.value.length + 1
    return `SUP-${String(count).padStart(3, '0')}`
}

function openAddModal() {
    isEditing.value = false
    editingName.value = null
    formError.value = ''
    Object.assign(form, emptyForm())
    form.supplier_id = nextSupplierId()
    showSupplierModal.value = true
}

function openEditModal(row) {
    isEditing.value = true
    editingName.value = row.name
    formError.value = ''
    Object.assign(form, {
        supplier_id: row.supplier_id,
        supplier_name: row.supplier_name,
        contact_person: row.contact_person,
        phone: row.phone,
        email: row.email,
        address: row.address,
        status: row.status,
    })
    showSupplierModal.value = true
}

function closeSupplierModal() {
    showSupplierModal.value = false
    formError.value = ''
}

async function submitSupplier() {
    formError.value = ''

    if (!form.supplier_id || !form.supplier_name) {
        formError.value = 'Please fill in Supplier ID and Supplier Name.'
        return
    }

    saving.value = true
    try {
        if (isEditing.value) {
            await updateSupplier(editingName.value, { ...form })
            toast.success('Supplier updated successfully!')
        } else {
            await addSupplier({ ...form })
            toast.success('Supplier added successfully!')
        }
        reloadSuppliers()
        closeSupplierModal()
    } catch (err) {
        console.error('Error saving supplier:', err)
        formError.value = err?.message || 'Failed to save. Please try again.'
    } finally {
        saving.value = false
    }
}

/* DELETE MODAL */
const showDeleteModal = ref(false)
const supplierToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function openDeleteModal(row) {
    supplierToDelete.value = row
    deleteError.value = ''
    showDeleteModal.value = true
}

function closeDeleteModal() {
    if (deleting.value) return
    showDeleteModal.value = false
    supplierToDelete.value = null
    deleteError.value = ''
}

async function confirmDelete() {
    if (!supplierToDelete.value) return
    deleting.value = true
    deleteError.value = ''
    try {
        await deleteSupplier(supplierToDelete.value.name)
        reloadSuppliers()
        toast.success('Supplier deleted.')
        showDeleteModal.value = false
        supplierToDelete.value = null
    } catch (err) {
        console.error(err)
        deleteError.value = err?.message || 'Failed to delete. Please try again.'
    } finally {
        deleting.value = false
    }
}
</script>