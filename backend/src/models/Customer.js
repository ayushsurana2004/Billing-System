const mongoose = require('mongoose');

// Customer schema for storing customer details
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Customer's full name
  phone: { type: String, unique: true }, // Phone number (must be unique)
  address: { type: String }, // Street address
  city: { type: String }, // City
  state: { type: String }, // State/Province
  zip: { type: Number } // Postal code as a number
});

// Create a unique index on phone field
customerSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);