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
const addProduct = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name required' });
  }

  try {
    const cleanName = name.trim().toLowerCase();
    const existing = await Product.findOne({ name: cleanName });
    if (existing) {
      return res.status(409).json({ error: 'Product already exists' });
    }

    const newProduct = await Product.create({ name: cleanName });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
};


module.exports = { getAllProducts,addProduct };
