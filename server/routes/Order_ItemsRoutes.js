const express = require('express');
const router = express.Router();
const { getItemsByOrderId } = require('../Controllers/orderItemsController');


router.get('/:orderId', getItemsByOrderId);

module.exports = router;
