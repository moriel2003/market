const express = require('express');
const router = express.Router();
const { getItemsByOrderId } = require('../Controllers/orderItemsController');

// GET /Order_Items/:orderId
router.get('/:orderId', getItemsByOrderId);

module.exports = router;
