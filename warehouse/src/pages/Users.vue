<template>
    <div class="min-h-screen flex-1 p-6 space-y-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="toggle" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition">
                    <FeatherIcon type="menu" />
                </button>
                <div>
                    <h2 class="text-2xl font-semibold text-gray-800">Users</h2>
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

        <div class="flex justify-between">
            <div class="flex items-center">
                <p class="text-sm text-gray-600 font-medium">
                    Manage system users and their access
                </p>
            </div>
            <div class="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                <FeatherIcon type="calendar" class="w-4 h-4" />
                {{ formattedDate }}
            </div>
        </div>

        <!-- ERROR STATE -->
        <div v-if="allUsersList.error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            Failed to load users: {{ allUsersList.error.message || allUsersList.error }}
        </div>

        <!-- SEARCH AND FILTERS -->
        <div class="border border-gray-300 rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="relative flex-1 min-w-[220px]">
                    <FeatherIcon type="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search user"
                        class="w-full pl-10 px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div class="flex items-center gap-4">
                    <select v-model="roleFilter" class="px-6 py-2 border border-gray-400 rounded-md text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">All Roles</option>
                        <option v-for="r in roleList.data" :key="r.name" :value="r.name">{{ r.name }}</option>
                    </select>
                    <select v-model="statusFilter" class="px-6 py-2 border border-gray-400 rounded-md text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Status: All</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <button
                        @click="openAddModal"
                        class="bg-blue-700 hover:bg-blue-600 px-4 py-2 text-sm text-white flex items-center gap-2 rounded-md transition"
                    >
                        <FeatherIcon type="plus" class="w-4 h-4" />
                        Add New User
                    </button>
                </div>
            </div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="allUsersList.loading || rolesLoading" class="text-center py-8">
            <p class="text-gray-500">Loading users...</p>
        </div>

        <!-- TABLE CARD -->
        <div v-else class="bg-white border border-gray-300 shadow-sm rounded-2xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
                        <tr>
                            <th class="p-4 text-left font-semibold">#</th>
                            <th class="p-4 text-left font-semibold">Full Name</th>
                            <th class="p-4 text-left font-semibold">Username</th>
                            <th class="p-4 text-left font-semibold">Role</th>
                            <th class="p-4 text-left font-semibold">Status</th>
                            <th class="p-4 text-left font-semibold">Date Created</th>
                            <th class="p-4 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, i) in paginatedItems" :key="row.name" class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="p-4 text-gray-600">{{ startIndex + i + 1 }}</td>
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0">
                                        <FeatherIcon type="user" size="14" class="text-white" />
                                    </div>
                                    <span class="font-medium text-gray-800">{{ row.full_name }}</span>
                                </div>
                            </td>
                            <td class="p-4 text-gray-600">{{ row.username || '-' }}</td>
                            <td class="p-4">
                                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" :class="roleBadgeClass(row.role)">
                                    {{ row.role || 'No Role' }}
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" :class="statusBadgeClass(row.enabled)">
                                    {{ row.enabled ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="p-4 text-gray-600">{{ formatDate(row.creation) }}</td>
                            <td class="p-4">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="openEditModal(row)" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition" title="Edit">
                                        <FeatherIcon type="edit-2" size="16" />
                                    </button>
                                    <button @click="openDeleteModal(row)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition" title="Delete">
                                        <FeatherIcon type="trash-2" size="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredItems.length === 0">
                            <td colspan="7" class="p-8 text-center text-gray-500">
                                No users found. Try adjusting your search or filters.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PAGINATION -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                    Showing {{ filteredItems.length === 0 ? 0 : startIndex + 1 }} to {{ endIndex }} of {{ filteredItems.length }} users
                </p>
                <div class="flex items-center gap-1">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100">
                        <FeatherIcon type="chevron-left" class="w-4 h-4" />
                    </button>
                    <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
                        :class="page === currentPage ? 'bg-blue-800 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'">
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

    <!-- ADD / EDIT USER MODAL -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
                <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600 transition">
                    <FeatherIcon type="x" size="20" />
                </button>
            </div>

            <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {{ formError }}
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                    <input type="text" v-model="form.full_name" placeholder="e.g. Juan Dela Cruz"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                    <input type="email" v-model="form.email" :disabled="isEditing" placeholder="juan.delacruz@example.com"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-70" />
                    <p v-if="isEditing" class="text-xs text-gray-400 mt-1">You cannot change the email if the user exists</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" v-model="form.username" placeholder="juan.delacruz"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
                    <select v-model="form.role" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="" disabled>Select a role</option>
                        <option v-for="r in roleList.data" :key="r.name" :value="r.name">{{ r.name }}</option>
                    </select>
                </div>
                <div v-if="!isEditing">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                    <input type="text" v-model="form.new_password" placeholder="Optional—auto-generated if left blank"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="form.enabled" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option :value="1">Active</option>
                        <option :value="0">Inactive</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                <button type="button" @click="closeFormModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                    Cancel
                </button>
                <button type="button" @click="submitUser" :disabled="saving"
                    class="px-6 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User') }}
                </button>
            </div>
        </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FeatherIcon type="trash-2" size="22" class="text-red-500" />
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Delete this user?</h3>
                <p class="text-sm text-gray-600">
                    You're about to delete <span class="font-medium text-gray-700">"{{ itemToDelete?.full_name }}"</span>. This can't be undone.
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useSidebar } from '../composables/useSidebar'
import { currentUser } from '../data/user'
import {
    allUsersList,
    fetchAllUsers,
    reloadAllUsers,
    addUser,
    updateUser,
    deleteUser,
    fetchUserRoles,
} from '../data/users'
import { roleList, fetchRoles } from '../data/role'
import FeatherIcon from 'vue-feather'
import { useToast } from 'vue-toastification'

const { toggle } = useSidebar()
const toast = useToast()

/* holds { [user.name]: ['RoleName', ...] } — pinapalitan nito yung dating
   userRolesList na hindi gumagana dahil child-table doctype ang "Has Role" */
const userRolesMap = ref({})
const rolesLoading = ref(false)

onMounted(async () => {
    await fetchAllUsers()
    fetchRoles()
    await loadUserRoles()
})

// kumukuha ng roles ng lahat ng kasalukuyang naka-listang users, one call per user
// (gamit ang frappe.client.get — ito yung paraan na kilala nang gumagana)
async function loadUserRoles() {
    rolesLoading.value = true
    try {
        const names = (allUsersList.data || []).map((u) => u.name)
        userRolesMap.value = await fetchUserRoles(names)
    } finally {
        rolesLoading.value = false
    }
}

const formattedDate = computed(() =>
    new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)

function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function roleBadgeClass(role) {
    switch (role) {
        case 'Administrator': return 'bg-blue-100 text-blue-700'
        case 'Inventory Manager': return 'bg-violet-100 text-violet-700'
        case 'Warehouse Staff': return 'bg-orange-100 text-orange-700'
        case 'Requestor': return 'bg-sky-100 text-sky-700'
        default: return 'bg-gray-100 text-gray-600'
    }
}

function statusBadgeClass(enabled) {
    return enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
}

// pinagsasama yung raw user list + roles map papunta sa isang listahan na
// may `role` field na direktang magagamit ng template
const mergedUsers = computed(() => {
    return (allUsersList.data || []).map((u) => ({
        ...u,
        role: userRolesMap.value[u.name]?.[0] || '',
    }))
})

/* SEARCH + FILTERS */
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(7)

const filteredItems = computed(() => {
    let items = mergedUsers.value

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter((u) =>
            u.full_name?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q)
        )
    }

    if (roleFilter.value) {
        items = items.filter((u) => u.role === roleFilter.value)
    }

    if (statusFilter.value !== '') {
        items = items.filter((u) => String(u.enabled) === statusFilter.value)
    }

    return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredItems.value.length))
const paginatedItems = computed(() => filteredItems.value.slice(startIndex.value, endIndex.value))

/* ADD / EDIT MODAL */
const showFormModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formError = ref('')

function emptyForm() {
    return {
        name: '',
        full_name: '',
        email: '',
        username: '',
        role: '',
        new_password: '',
        enabled: 1,
    }
}

const form = reactive(emptyForm())

function openAddModal() {
    formError.value = ''
    isEditing.value = false
    Object.assign(form, emptyForm())
    showFormModal.value = true
}

function openEditModal(row) {
    formError.value = ''
    isEditing.value = true
    Object.assign(form, {
        name: row.name,
        full_name: row.full_name,
        email: row.name,
        username: row.username,
        role: row.role,
        new_password: '',
        enabled: row.enabled ? 1 : 0,
    })
    showFormModal.value = true
}

function closeFormModal() {
    showFormModal.value = false
    formError.value = ''
}

async function submitUser() {
    formError.value = ''

    if (!form.full_name || !form.email || !form.role) {
        formError.value = 'Please fill in Full Name, Email and Role.'
        return
    }

    saving.value = true
    try {
        const nameParts = form.full_name.trim().split(/\s+/)
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ')

        if (isEditing.value) {
            await updateUser(form.name, {
                first_name: firstName,
                last_name: lastName,
                username: form.username,
                enabled: form.enabled,
                roles: [{ role: form.role }],
            })
            toast.success('User updated!')
        } else {
            const payload = {
                email: form.email,
                first_name: firstName,
                last_name: lastName,
                username: form.username || form.email.split('@')[0],
                enabled: form.enabled,
                send_welcome_email: 0,
                roles: [{ doctype: 'Has Role', role: form.role }],
            }
            if (form.new_password) payload.new_password = form.new_password
            await addUser(payload)
            toast.success('User created!')
        }
        await reloadAllUsers()
        await loadUserRoles() // i-refresh yung roles pagkatapos mag-add/edit
        closeFormModal()
    } catch (err) {
        console.error('Error saving user:', err)
        formError.value = err?.message || 'Failed to save. Please try again.'
    } finally {
        saving.value = false
    }
}

/* DELETE */
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function openDeleteModal(row) {
    itemToDelete.value = row
    deleteError.value = ''
    showDeleteModal.value = true
}

function closeDeleteModal() {
    if (deleting.value) return
    showDeleteModal.value = false
    itemToDelete.value = null
    deleteError.value = ''
}

async function confirmDelete() {
    if (!itemToDelete.value) return
    deleting.value = true
    deleteError.value = ''
    try {
        await deleteUser(itemToDelete.value.name)
        await reloadAllUsers()
        await loadUserRoles()
        toast.success('User deleted')
        showDeleteModal.value = false
        itemToDelete.value = null
    } catch (err) {
        console.error(err)
        deleteError.value = err?.message || 'Failed to delete. Please try again.'
    } finally {
        deleting.value = false
    }
}
</script>