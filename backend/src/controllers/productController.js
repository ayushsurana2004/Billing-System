const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { barcode, name, price, quantity, size, category, supplier } = req.body;
    
    // Calculate GST based on price
    let gstRate;
    if (price < 1000) {
      gstRate = 0.05; // 5% GST for products below ₹1000
    } else {
      gstRate = 0.12; // 12% GST for products ₹1000 and above
    }
    
    const gstAmount = price * gstRate;
    const priceAfterGST = price + gstAmount;
    
    const product = new Product({
      barcode,
      name,
      price,
      priceAfterGST,
      gstAmount,
      quantity,
      size,
      category,
      supplier
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Product with this barcode already exists' });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a product by barcode
exports.getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product by barcode
exports.updateProductByBarcode = async (req, res) => {
  try {
    const { barcode, name, price, quantity, size, category, supplier } = req.body;
    
    // Calculate GST based on price
    let gstRate;
    if (price < 1000) {
      gstRate = 0.05; // 5% GST for products below ₹1000
    } else {
      gstRate = 0.12; // 12% GST for products ₹1000 and above
    }
    
    const gstAmount = price * gstRate;
    const priceAfterGST = price + gstAmount;
    
    const product = await Product.findOneAndUpdate(
      { barcode: req.params.barcode },
      {
        barcode,
        name,
        price,
        priceAfterGST,
        gstAmount,
        quantity,
        size,
        category,
        supplier
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a product by barcode
exports.deleteProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ barcode: req.params.barcode });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};