const Supplier = require('../models/suppliersModel');
const Product = require('../models/productsModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const postNewSupplier = async (req, res) => {
  try {
    const {
      company_name,
      phone,
      representative_name,
      username,
      password,
      products,
    } = req.body;
console.log('BODY RECEIVED:', req.body);

    // Basic required field check
    if (!company_name || !phone || !representative_name || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'At least one product must be provided' });
    }

    const cleanProducts = [];

    for (let item of products) {
      const cleanName = item.product_name?.trim().toLowerCase();
      if (
        !cleanName ||
        item.price_per_unit === undefined ||
        item.minimum_quantity === undefined ||
        isNaN(item.price_per_unit) ||
        isNaN(item.minimum_quantity) ||
        parseFloat(item.price_per_unit) <= 0 ||
        parseInt(item.minimum_quantity) <= 0
      ) {
        return res
          .status(400)
          .json({ error: `Invalid product data for "${item.product_name}"` });
      }

      cleanProducts.push({
        product_name: cleanName,
        price_per_unit: parseFloat(item.price_per_unit),
        minimum_quantity: parseInt(item.minimum_quantity),
      });
    }

    const supplier = new Supplier({
      company_name,
      phone,
      representative_name,
      username,
      password,
      products: cleanProducts,
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Supplier creation failed:', err); // already there
    res.status(500).json({ error: err.message || 'Server error during supplier creation' });
  }
  
};
//  Login an existing supplier
const loginSupplier = async (req, res) => {
  const { username, password } = req.body;

  try {
    const supplier = await Supplier.findOne({ username });

    if (!supplier) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, supplier.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
      
    }

    res.status(200).json({
      _id: supplier._id,
      username: supplier.username
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// 🔹 Get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const allSuppliers = await Supplier.find({});
    res.status(200).json(allSuppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

// Get a supplier by ID
const getSupplierByID = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid supplier ID' });
  }

  try {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get supplier' });
  }
};

module.exports = {
  postNewSupplier,
  loginSupplier,
  getAllSuppliers,
  getSupplierByID
};
