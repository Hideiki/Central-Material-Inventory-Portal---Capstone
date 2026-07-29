import frappe
from frappe.model.document import Document

class StockWithdrawal(Document):
	def validate(self):
		self.calculate_totals()
		self.validate_stock_availability()

	def calculate_totals(self):
		total_quantity = 0
		total_amount = 0

		for item in self.items:
			item.total_cost = (item.issue_qty or 0) * (item.unit_cost or 0)
			total_quantity += item.issue_qty or 0
			total_amount += item.total_cost

		self.total_items = len(self.items)
		self.total_quantity = total_quantity
		self.total_amount = total_amount

	def validate_stock_availability(self):	
		for item in self.items:
			if not item.item_code:
				continue
			available = frappe.db.get_value("Product", item.item_code, "current_stock") or 0
			if (item.issue_qty or 0) > available:
				frappe.throw(
					f"Cannot withdraw {item.issue_qty} of {item.product_name}—only {available} in stock."
				)

	def after_insert(self):
		for item in self.items:
			if not item.item_code:
				continue
			product = frappe.get_doc("Product", item.item_code)
			product.current_stock = (product.current_stock or 0) - (item.issue_qty or 0)
			product.save(ignore_permissions=True)