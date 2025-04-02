const Product = require('../models/productsModel');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // return all product names
    res.status(200).json(products);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

module.exports = { getAllProducts };
