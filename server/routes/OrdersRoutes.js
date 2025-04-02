const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  updateOrderStatus,
  getOrderById
} = require('../controllers/ordersController');

router.get('/', getAllOrders);               // list all orders
router.get('/:id', getOrderById);            // 🟢 get single order
router.patch('/:id', updateOrderStatus);     // update status

module.exports = router;

