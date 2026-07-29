import { createResource } from 'frappe-ui'

/* update yung basic info (full name, username) ng currently logged-in user */
export async function updateAccountInfo(values) {
    const getResource = createResource({ url: 'frappe.client.get' })
    const saveResource = createResource({ url: 'frappe.client.save' })

    const doc = await getResource.submit({ doctype: 'User', name: values.email })

    doc.full_name = values.full_name
    doc.username = values.username

    return saveResource.submit({ doc })
}

/* Built-in Frappe method para sa password change ng SARILING account */
export function updatePassword(newPassword) {
    const changePassword = createResource({
        url: 'frappe.core.doctype.user.user.update_password',
    })
    return changePassword.submit({ new_password: newPassword })
}