import { createListResource } from "frappe-ui";

export const reportLogList = createListResource({
    doctype: 'Report Log',
    fields: [
        'name',
        'reference_no',
        'report_type',
        'date_from',
        'date_to',
        'category',
        'prepared_by',
        'status',
        'creation',
    ],
    orderBy: 'creation desc',
    limit: 100,
    auto: true
})

export function fetchReportLogs() {
    reportLogList.fetch()
}

export function reloadReportLogs() {
    reportLogList.reload()
}

export function saveReportLog(values) {
    return reportLogList.insert.submit(values)
}