const Order = require('../models/ordersModel');
const Supply = require('../models/supplyModel');
const mongoose = require('mongoose');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('supplier_id', 'company_name') // get company name from supplier
      .sort({ order_date: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      order_date: order.order_date,
      status: order.status,
      supplier_name: order.supplier_id?.company_name || 'Unknown',
      items: order.items || [] 
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};


// PATCH update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If changing from "in-process" to "Completed", update supply
    if (status === 'Completed' && order.status === 'in-process') {
      for (const item of order.items) {
        const supply = await Supply.findOne({ product_name: item.product_name });

        if (supply) {
          supply.current_quantity += item.quantity;
          await supply.save();
        } else {
          console.warn(`No supply entry found for ${item.product_name}`);
        }
      }
    }

    // Update the status
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error while updating order status.' });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  console.log('getOrderById CALLED with ID:', id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    console.error('Error in getOrderById:', err);
    res.status(500).json({ error: 'Failed to get order' });
  }
};
// POST /Orders
const createOrder = async (req, res) => {
  try {
    const { supplier_id, items } = req.body;

    if (!supplier_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing supplier or items' });
    }

    const newOrder = await Order.create({
      supplier_id,
      items,
      status: 'Pending Approval'
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Failed to create order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};


module.exports = {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  createOrder,
  
};
