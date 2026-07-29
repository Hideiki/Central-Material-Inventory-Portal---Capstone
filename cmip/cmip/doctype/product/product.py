# Copyright (c) 2026, RK and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Product(Document):
	def validate(self):
		self.update_status()

	def update_status(self):
		current_stock = self.current_stock or 0
		reorder_level = self.reorder_level or 0

		if current_stock <= 0:
			self.status = "Out of Stock"
		elif current_stock <= reorder_level:
			self.status = "Low Stock"
		else:
			self.status = "In Stock"
