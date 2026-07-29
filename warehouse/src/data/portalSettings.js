import { createDocumentResource } from 'frappe-ui'

/* Single doctype, parehong pangalan ng doctype at ng "document name" */
export const portalSettings = createDocumentResource({
    doctype: 'Portal Settings',
    name: 'Portal Settings',
    auto: true,
})

export function fetchPortalSettings() {
    return portalSettings.reload()
}

export function savePortalSettings(values) {
    return portalSettings.setValue.submit(values)
}