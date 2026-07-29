import frappe
from frappe.model.document import Document

class MaterialReturn(Document):
	def validate(self):
		self.calculate_total()

	def calculate_total(self):
		total = 0
		for item in self.items:
			item.total_cost = (item.quantity_returned or 0) * (item.unit_cost or 0)
			total += item.total_cost
		self.total_amount = total

	def after_insert(self):
		# Stock is only added back once the return is Approved (i.e. the
		# user pressed "Submit Return"). A "Save as Draft" record keeps
		# return_status = "Pending" and does NOT touch stock yet.
		if self.return_status == "Approved":
			for item in self.items:
				if not item.item_code:
					continue
				product = frappe.get_doc("Product", item.item_code)
				product.current_stock = (product.current_stock or 0) + (item.quantity_returned or 0)
				product.save(ignore_permissions=True)