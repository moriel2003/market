const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  price_per_unit: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  min_quantity: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Product', ProductSchema);