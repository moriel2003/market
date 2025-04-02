const express = require('express');
const router = express.Router();
const {
  postNewSupplier,
  getAllSuppliers,
  getSupplierByID,
  loginSupplier
} = require('../controllers/suppliersController');

router.post('/', postNewSupplier);
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierByID);
router.post('/login', loginSupplier); 

module.exports = router;
