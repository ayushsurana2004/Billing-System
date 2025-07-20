const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Route to create a new invoice
router.post('/', invoiceController.createInvoice);

// Route to get all invoices
router.get('/', invoiceController.getAllInvoices);

// Route to get an invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Route to delete an invoice by ID
router.delete('/:id', invoiceController.deleteInvoice);

// Route to update an invoice by ID
router.put('/:id', invoiceController.updateInvoice);

module.exports = router;