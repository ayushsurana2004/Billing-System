const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { products } = req.body;

    // 1. Check stock for each product
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found.` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` });
      }
    }

    // 2. Create invoice
    const invoice = new Invoice(req.body);
    await invoice.save();

    // 3. Reduce stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
    }

    // 4. Populate and return invoice
    await invoice.populate('customer');
    await invoice.populate('products.product');
    res.status(201).json(invoice);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer')
      .populate('products.product');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get an invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('products.product');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product quantities when invoice is created
exports.updateProductQuantities = async (products) => {
  for (let item of products) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { quantity: -item.quantity } }
    );
  }
};

// Update an invoice and adjust stock
exports.updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updatedData = req.body;
    const newProducts = updatedData.products;

    // 1. Fetch the original invoice
    const originalInvoice = await Invoice.findById(invoiceId);
    if (!originalInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // 2. Restore stock for original invoice products
    for (const item of originalInvoice.products) {
      const productId = item.product._id ? item.product._id : item.product;
      await Product.findByIdAndUpdate(productId, { $inc: { quantity: item.quantity } });
    }

    // 3. Check stock for new products
    for (const item of newProducts) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found.` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` });
      }
    }

    // 4. Decrease stock for new products
    for (const item of newProducts) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
    }

    // 5. Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, updatedData, { new: true })
      .populate('customer')
      .populate('products.product');

    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an invoice and restore product stock
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    // Restore stock for each product in the invoice
    for (const item of invoice.products) {
      const productId = item.product._id ? item.product._id : item.product;
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity: item.quantity } }
      );
    }
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted and stock restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};