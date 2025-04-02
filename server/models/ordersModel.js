const mongoose = require('mongoose');

// Embedded subdocument schema for individual items
const OrderItemSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending Approval', 'In Process', 'Completed'],
    default: 'Pending Approval'
  },
  items: [OrderItemSchema] // ✅ Embedded array of items
});

module.exports = mongoose.model('Order', OrderSchema);
