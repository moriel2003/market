const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../Controllers/productsController');

// GET /Products
router.get('/', getAllProducts);

module.exports = router;
