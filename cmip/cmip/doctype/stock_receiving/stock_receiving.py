import frappe
from frappe.model.document import Document

class StockReceiving(Document):
    def validate(self):
        # Auto-fill received_by gamit ang kasalukuyang naka-login na user
        if not self.received_by:
            self.received_by = frappe.session.user

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