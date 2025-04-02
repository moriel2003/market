const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
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
  }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
