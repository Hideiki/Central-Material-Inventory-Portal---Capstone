import { createListResource } from "frappe-ui";

export const roleList = createListResource({
    doctype: 'Role',
    fields: ['name'],
    filters: [['name', 'not in', ['Guest', 'All', 'System Manager']]],
    orderBy: 'name asc',
    limit: 100,
    auto: true
})

export function fetchRoles() {
    roleList.fetch()
}