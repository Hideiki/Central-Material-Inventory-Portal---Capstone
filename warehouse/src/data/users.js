/* import { createListResource, createResource } from 'frappe-ui'

export const usersList = createListResource({
    doctype: 'User',
    fields: ['name', 'full_name'],
    filters: { enabled: 1 },
    orderBy: 'full_name asc',
    limit: 100,
    auto: true,
})

export function fetchUsers() {
    usersList.fetch()
}

export const allUsersList = createListResource({
    doctype: 'User',
    fields: ['name', 'full_name', 'username', 'enabled', 'creation'],
    filters: [['name', 'not in', ['Administrator', 'Guest']]],
    orderBy: 'creation desc',
    limit: 100,
    auto: true
})

export function fetchAllUsers() {
    return allUsersList.fetch()
}

export function reloadAllUsers() {
    return allUsersList.reload()
}

export function addUser(values) {
    return allUsersList.insert.submit(values)
}

export async function updateUser(name, values) {
    const getResource = createResource({ url: 'frappe.client.get' })
    const saveResource = createResource({ url: 'frappe.client.save' })

    const doc = await getResource.submit({ doctype: 'User', name })

    doc.first_name = values.first_name
    doc.last_name = values.last_name
    doc.username = values.username
    doc.enabled = values.enabled

    if (values.roles) {
        doc.roles = values.roles.map((r) => ({ doctype: 'Has Role', role: r.role }))
    }

    return saveResource.submit({ doc })
}

export function deleteUser(name) {
    return allUsersList.delete.submit(name)
}

export async function fetchUserRoles(userNames = []) {
    const getResource = createResource({ url: 'frappe.client.get' })
    const rolesByUser = {}

    await Promise.all(
        userNames.map(async (name) => {
            try {
                const doc = await getResource.submit({ doctype: 'User', name })
                rolesByUser[name] = (doc.roles || [])
                    .map((r) => r.role)
                    .filter((r) => !['All', 'Guest'].includes(r))
            } catch (err) {
                console.error(`Failed to fetch roles for ${name}:`, err)
                rolesByUser[name] = []
            }
        })
    )

    return rolesByUser
} */
import { createListResource, createResource } from 'frappe-ui'

export const usersList = createListResource({
    doctype: 'User',
    fields: ['name', 'full_name'],
    filters: { enabled: 1 },
    orderBy: 'full_name asc',
    limit: 100,
    auto: true,
})

export function fetchUsers() {
    usersList.fetch()
}

export const allUsersList = createListResource({
    doctype: 'User',
    fields: ['name', 'full_name', 'username', 'enabled', 'creation'],
    filters: [['name', 'not in', ['Administrator', 'Guest']]],
    orderBy: 'creation desc',
    limit: 100,
    auto: true,
})

export function fetchAllUsers() {
    return allUsersList.fetch()
}

export function reloadAllUsers() {
    return allUsersList.reload()
}

export function addUser(values) {
    return allUsersList.insert.submit(values)
}

export async function updateUser(name, values) {
    const resource = createResource({ url: 'cmip.api.update_user_with_roles' })
    return resource.submit({
        user_name: name,
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        enabled: values.enabled,
        role: values.roles?.[0]?.role || '',
    })
}

export function deleteUser(name) {
    return allUsersList.delete.submit(name)
}

export async function fetchUserRoles(userNames = []) {
    const resource = createResource({ url: 'cmip.api.get_user_with_roles' })
    const rolesByUser = {}

    await Promise.all(
        userNames.map(async (name) => {
            try {
                const doc = await resource.submit({ user_name: name })
                rolesByUser[name] = doc.roles || []
            } catch (err) {
                console.error(`Failed to fetch roles for ${name}:`, err)
                rolesByUser[name] = []
            }
        })
    )

    return rolesByUser
}