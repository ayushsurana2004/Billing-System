const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route to create a new customer
router.post('/', customerController.createCustomer);

// Route to get all customers
router.get('/', customerController.getAllCustomers);

// Route to get a customer by phone number
router.get('/phone/:phone', customerController.getCustomerByPhone);

// Route to delete a customer by ID
router.delete('/:id', customerController.deleteCustomer);

// Route to update a customer by phone number
router.put('/phone/:phone', customerController.updateCustomerByPhone);

// Route to delete a customer by phone number
router.delete('/phone/:phone', customerController.deleteCustomerByPhone);

module.exports = router;