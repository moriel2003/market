const mongoose = require('mongoose');

const SupplierProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true
  },
  price_per_unit: {
    type: Number,
    required: true
  },
  minimum_quantity: {
    type: Number,
    required: true
  }
});

const SupplierSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  representative_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  


  password: {
    type: String,
    required: true
  },
  products: [SupplierProductSchema] //  list of supplier's product details
});

module.exports = mongoose.model('Supplier', SupplierSchema);
