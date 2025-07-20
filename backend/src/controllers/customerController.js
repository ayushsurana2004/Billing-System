const Customer = require('../models/Customer');

// Create a new customer
// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
      // Check if customer with this phone number already exists
      const existingCustomer = await Customer.findOne({ phone: req.body.phone });
      if (existingCustomer) {
        return res.status(400).json({ 
          message: 'Customer with this phone number already exists' 
        });
      }
  
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (err) {
      if (err.code === 11000) {
        res.status(400).json({ 
          message: 'Customer with this phone number already exists' 
        });
      } else {
        res.status(400).json({ message: err.message });
      }
    }
  };

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get customer by phone number
exports.getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a customer by ID
exports.deleteCustomer = async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // Update a customer by phone number
exports.updateCustomerByPhone = async (req, res) => {
    try {
      const customer = await Customer.findOneAndUpdate(
        { phone: req.params.phone }, 
        req.body, 
        { new: true, runValidators: true }
      );
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // Delete a customer by phone number
  exports.deleteCustomerByPhone = async (req, res) => {
    try {
      const customer = await Customer.findOneAndDelete({ phone: req.params.phone });
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };