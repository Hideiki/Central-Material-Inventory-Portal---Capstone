import { createResource } from 'frappe-ui'

export function sendPasswordResetLink(email) {
    const resource = createResource({
        url: 'frappe.core.doctype.user.user.reset_password',
    })
    return resource.submit({ user: email })
}