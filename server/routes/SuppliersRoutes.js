const express = require('express');
const router = express.Router();
const {
  postNewSupplier,
  getAllSuppliers,
  getSupplierByID,
  loginSupplier,
  updateSupplierProducts
} = require('../Controllers/suppliersController');

router.post('/', postNewSupplier);
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierByID);
router.post('/login', loginSupplier); 
router.post('/:id/products', updateSupplierProducts);


module.exports = router;
