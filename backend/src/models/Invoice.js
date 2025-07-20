const mongoose = require('mongoose');

// Invoice schema for billing records
const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Reference to Customer
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product
      quantity: { type: Number, required: true }, // Quantity sold
      price: { type: Number, required: true } // Price per unit at time of sale
    }
  ],
  total: { type: Number, required: true }, // Total invoice amount (after GST/discount)
  gstPercent: { type: Number }, // GST percentage applied
  gstValue: { type: Number }, // GST value in currency
  discountPercent: { type: Number }, // Discount percentage applied
  discountValue: { type: Number }, // Discount value in currency
  date: { type: Date, default: Date.now } // Date of invoice
});

module.exports = mongoose.model('Invoice', invoiceSchema);
