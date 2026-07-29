""" import frappe
from frappe import _
from frappe.utils.password import update_password

@frappe.whitelist(allow_guest=True)
def register_user(email, first_name, username, new_password):
    if frappe.db.exists("User", email):
        frappe.throw(_("Email is already registered."))
        
    if username and frappe.db.exists("User", {"username": username}):
        frappe.throw(_("Username is already taken."))

    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": first_name,
        "username": username or email,
        "send_welcome_email": 0,
        "user_type": "System User",
        "enabled": 1
    })
    
    user.insert(ignore_permissions=True) 

    update_password(user.name, new_password)

    return {
        "status": "success",
        "message": _("Account created successfully!")
    }

@frappe.whitelist(allow_guest=True)
def get_all_user_roles():
    roles = frappe.get_all("Role", pluck="name")
    return roles """
import frappe
from frappe import _
from frappe.utils.password import update_password

@frappe.whitelist(allow_guest=True)
def register_user(email, first_name, username, new_password):
    if frappe.db.exists("User", email):
        frappe.throw(_("Email is already registered."))
        
    if username and frappe.db.exists("User", {"username": username}):
        frappe.throw(_("Username is already taken."))

    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": first_name,
        "username": username or email,
        "send_welcome_email": 0,
        "user_type": "System User",
        "enabled": 1
    })
    
    user.insert(ignore_permissions=True) 

    update_password(user.name, new_password)

    return {
        "status": "success",
        "message": _("Account created successfully!")
    }

@frappe.whitelist(allow_guest=True)
def get_all_user_roles():
    roles = frappe.get_all("Role", pluck="name")
    return roles

@frappe.whitelist()
def get_user_with_roles(user_name):
    if not frappe.has_permission("User", "read", user_name):
        frappe.throw(_("Not permitted to view this user."), frappe.PermissionError)

    doc = frappe.get_doc("User", user_name)
    return {
        "name": doc.name,
        "full_name": doc.full_name,
        "username": doc.username,
        "enabled": doc.enabled,
        "roles": [r.role for r in doc.roles if r.role not in ("All", "Guest")],
    }


@frappe.whitelist()
def update_user_with_roles(user_name, first_name, last_name, username, enabled, role):
    if not frappe.has_permission("User", "write", user_name):
        frappe.throw(_("Not permitted to edit this user."), frappe.PermissionError)

    doc = frappe.get_doc("User", user_name)
    doc.first_name = first_name
    doc.last_name = last_name
    doc.username = username
    doc.enabled = enabled

    doc.set("roles", [])
    if role:
        doc.append("roles", {"role": role})

    doc.save()
    return {"status": "success"}