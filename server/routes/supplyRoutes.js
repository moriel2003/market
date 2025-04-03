const express = require('express');
const router = express.Router();
const Supply = require('../models/supplyModel');
const Supplier = require('../models/suppliersModel');
const Order = require('../models/ordersModel');

router.post('/update', async (req, res) => {
  const purchase = req.body; // e.g., { "milk": 4, "bread": 1 }

  try {
    for (const [product, quantitySold] of Object.entries(purchase)) {
      const supply = await Supply.findOne({ product_name: product });
      if (!supply) continue;

      // Update inventory
      supply.current_quantity -= quantitySold;
      await supply.save();

      // Reorder if below minimum
      if (supply.current_quantity < supply.minimum_quantity) {
        const suppliers = await Supplier.find({ "products.product_name": product });

        if (suppliers.length === 0) {
          console.warn(`⚠️ No supplier found for ${product}`);
          continue;
        }

        let bestSupplier = null;
        let bestPrice = Infinity;

        for (const supplier of suppliers) {
          const item = supplier.products.find(p => p.product_name === product);
          if (item && item.price_per_unit < bestPrice) {
            bestSupplier = supplier;
            bestPrice = item.price_per_unit;
          }
        }

        if (!bestSupplier) continue;

        // Create order
        await Order.create({
          supplier_id: bestSupplier._id,
          status: 'in-process',
          items: [
            {
              product_name: product,
              quantity: supply.minimum_quantity,
              price: bestPrice
            }
          ]
        });

        console.log(`✅ Auto-order placed for ${product} from ${bestSupplier.company_name}`);
      }
    }

    res.status(200).json({ message: "Supply updated successfully." });
  } catch (error) {
    console.error("❌ Error updating supply:", error);
    res.status(500).json({ error: "Error updating supply." });
  }
});

module.exports = router;
