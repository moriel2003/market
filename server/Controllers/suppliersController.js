const Supplier = require('../models/suppliersModel');
const Product = require('../models/productsModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const updateSupplierProducts = async (req, res) => {
  const supplierId = req.params.id;
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Products must be an array' });
  }

  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    for (const incoming of products) {
      const existingIndex = supplier.products.findIndex(
        p => p.product_name === incoming.product_name
      );

      if (existingIndex !== -1) {
        // Update price and quantity
        supplier.products[existingIndex].price_per_unit = incoming.price_per_unit;
        supplier.products[existingIndex].minimum_quantity = incoming.minimum_quantity;
      } else {
        supplier.products.push(incoming);
      }
    }

    await supplier.save();
    res.status(200).json({ message: 'Products added/updated successfully' });
  } catch (err) {
    console.error('Error updating supplier products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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


    // Basic required field check
    if (!company_name || !phone || !representative_name || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }



    const cleanProducts = [];

    if (Array.isArray(products)) {
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
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const supplier = new Supplier({
      company_name,
      phone,
      representative_name,
      username,
      password: hashedPassword,
      products: cleanProducts
    });
    

    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Supplier creation failed: ', err);

    if (err.code === 11000 && err.keyValue) {
      const duplicateField = Object.keys(err.keyValue)[0]; // 'phone' or 'username'
      return res.status(400).json({ error: `${duplicateField} already exists` });
    }

    res.status(500).json({ error: err.message || 'Server error during supplier creation' });
  }

};
//  Login an existing supplier
const loginSupplier = async (req, res) => {
  const { username, password } = req.body;

  try {
    const supplier = await Supplier.findOne({ username });

    if (!supplier) {
      return res.status(402).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, supplier.password);
    console.log(password, supplier.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password!' });
      
    }

    res.status(200).json({
      _id: supplier._id,
      username: supplier.username
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

//Get all suppliers
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
  getSupplierByID,
  updateSupplierProducts
};
