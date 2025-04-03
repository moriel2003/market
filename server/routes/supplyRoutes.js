const express = require('express');
const router = express.Router();
const { makePurchase } = require('../Controllers/supplyController');

router.post('/update', makePurchase);

module.exports = router;
