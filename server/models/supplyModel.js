
const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  product_name: { type: String, required: true, unique: true },
  current_quantity: { type: Number, required: true },
  minimum_quantity: { type: Number, required: true }
});

module.exports = mongoose.model('supply', supplySchema);
