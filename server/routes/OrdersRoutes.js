const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  createOrder,
} = require('../Controllers/ordersController');

router.get('/', getAllOrders);               // list all orders
router.get('/:id', getOrderById);            // 🟢 get single order
router.patch('/:id', updateOrderStatus);     // update status
router.post('/', createOrder); // ✅ add this

module.exports = router;

