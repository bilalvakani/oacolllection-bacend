const express = require('express');
const { getProducts, getProductBySlug, createProduct } = require('../controllers/productController');
const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', createProduct); // In production, add auth middleware here

module.exports = router;
