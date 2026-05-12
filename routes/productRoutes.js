const express = require('express');
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct); // In production, add auth middleware here
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:slug', getProductBySlug); // Keep slug route last to avoid conflicts

module.exports = router;
