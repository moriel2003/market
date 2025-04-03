const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  createOrder,
} = require('../Controllers/ordersController');

router.get('/', getAllOrders);          
router.get('/:id', getOrderById);          
router.patch('/:id', updateOrderStatus);     
router.post('/', createOrder); 

module.exports = router;

