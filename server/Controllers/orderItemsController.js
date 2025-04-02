const OrderItem = require('../models/order_ItemModel');

// GET all order items for a specific order
const getItemsByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const items = await OrderItem.find({ order_id: orderId });
    res.status(200).json(items);
  } catch (err) {
    console.error('Failed to fetch order items:', err);
    res.status(500).json({ error: 'Could not fetch order items' });
  }
};

module.exports = {
  getItemsByOrderId
};
