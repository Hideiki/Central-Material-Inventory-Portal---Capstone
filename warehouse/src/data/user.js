import router from "@/router"
import { createResource } from "frappe-ui"
import { computed, watch } from "vue"

export const userResource = createResource({
    url: "frappe.auth.get_logged_user",
    cache: "User",
    onError(error) {
        if (error?.exc_type === "AuthenticationError") {
            router.push({ name: "Login" })
        }
    },
})

export const userDetails = createResource({
    url: "frappe.client.get",
    auto: false,
})


watch(
    () => userResource.data,
    (email) => {
        if (!email) return

        userDetails.update({
            params: { doctype: "User", name: email },
        })
        userDetails.fetch()
    },
    { immediate: true }
)

export const currentUser = computed(() => {
    return userDetails.data || {
        username: userResource.data || "Guest",
    }
})