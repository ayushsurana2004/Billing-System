const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route to create a new product
router.post('/', productController.createProduct);

// Route to get all products
router.get('/', productController.getAllProducts);

// Route to get a product by barcode
router.get('/barcode/:barcode', productController.getProductByBarcode);

// Route to update a product by barcode
router.put('/barcode/:barcode', productController.updateProductByBarcode);

// Route to delete a product by barcode
router.delete('/barcode/:barcode', productController.deleteProductByBarcode);

module.exports = router;