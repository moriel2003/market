const express = require('express');
const router = express.Router();
const { getAllProducts,addProduct } = require('../Controllers/productsController');

// GET /Products
router.get('/', getAllProducts);
router.post('/', addProduct);

module.exports = router;
