const Supplier = require('../models/suppliersModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 🔹 Register a new supplier
const postNewSupplier = async (req, res) => {
  const {
    company_name,
    phone,
    representative_name,
    username,
    password
  } = req.body;

  try {
    // Check if username already exists
    const existing = await Supplier.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create supplier
    const newSupplier = await Supplier.create({
      company_name,
      phone,
      representative_name,
      username,
      password: hashedPassword
    });

    res.status(200).json({
      _id: newSupplier._id,
      username: newSupplier.username
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
