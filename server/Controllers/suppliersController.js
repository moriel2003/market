const Supplier = require('../models/suppliersModel');
const Product = require('../models/productsModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const postNewSupplier = async (req, res) => {
  const {
    company_name,
    phone,
    representative_name,
    username,
    password,
    products = [] // list of { product_name, price_per_unit, minimum_quantity }
  } = req.body;

  try {
    const cleanProducts = [];

    for (const item of products) {
      if (
        !item.product_name ||
        !item.price_per_unit ||
        !item.minimum_quantity ||
        isNaN(item.price_per_unit) ||
        isNaN(item.minimum_quantity) ||
        parseFloat(item.price_per_unit) <= 0 ||
        parseInt(item.minimum_quantity) <= 0
      ) {
        return res.status(400).json({ error: `Invalid product data for "${item.product_name}"` });
      }

      const cleanName = item.product_name.trim().toLowerCase();

      // Check if product already exists in central product list
      const existing = await Product.findOne({ name: cleanName });

      if (!existing) {
        await Product.create({ name: cleanName }); // only add if truly new
      }

      cleanProducts.push({
        product_name: cleanName,
        price_per_unit: parseFloat(item.price_per_unit),
        minimum_quantity: parseInt(item.minimum_quantity)
      });
    }

    const newSupplier = await Supplier.create({
      company_name,
      phone,
      representative_name,
      username,
      password,
      products: cleanProducts
    });

    res.status(201).json(newSupplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
};

// 🔹 Login an existing supplier
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

// 🔹 Get a supplier by ID
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
