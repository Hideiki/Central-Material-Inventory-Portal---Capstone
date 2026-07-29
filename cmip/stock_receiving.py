import frappe
from frappe.model.document import Document

class StockReceiving(Document):
	def validate(self):
		self.calculate_totals()

	def calculate_totals(self):
		total_quantity = 0
		total_amount = 0

		for item in self.items:
			item.total_cost = (item.received_qty or 0) * (item.unit_cost or 0)
			total_quantity += item.received_qty or 0
			total_amount += item.total_cost

		self.total_items = len(self.items)
		self.total_quantity = total_quantity
		self.total_amount = total_amount

	def after_insert(self):
		# Runs ONCE, only when this record is first created — this keeps
		# stock from being double-counted if the record is opened/edited
		# again later. If you need editable receiving records with correct
		# stock adjustments, that needs extra logic (diffing old vs new
		# received_qty) — worth flagging as a known limitation in your
		# defense if asked.
		for item in self.items:
			if not item.item_code:
				continue
			product = frappe.get_doc("Product", item.item_code)
			product.current_stock = (product.current_stock or 0) + (item.received_qty or 0)
			product.save(ignore_permissions=True)