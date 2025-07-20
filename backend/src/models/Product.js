const mongoose = require('mongoose');

// Product schema for inventory items
const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true }, // Barcode as primary identifier
  name: { type: String, required: true }, // Name of the product
  price: { type: Number, required: true }, // Price per unit (before GST)
  priceAfterGST: { type: Number, required: true }, // Price after GST
  gstAmount: { type: Number, required: true }, // GST amount
  quantity: { type: Number, required: true }, // Number of items in stock
  size: { type: String, required: true }, // Size of the product
  category: { 
    type: String, 
    enum: ['men', 'women', 'kids'], // Only allow these three options
    required: true 
  },
  supplier: { type: String } // Supplier name or ID
}, { 
  versionKey: false // Remove __v field
});

// Create a unique index on barcode field
productSchema.index({ barcode: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);