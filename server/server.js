const express = require('express');
const mongoose = require('mongoose');
const OrdersRoutes = require('./routes/OrdersRoutes');
const ProductsRoutes = require('./routes/ProductsRoutes');
const StoreOwnerRoutes = require('./routes/StoreOwnerRoutes');
const SuppliersRoutes = require('./routes/SuppliersRoutes');
const supplyRoutes = require('./routes/supplyRoutes');




require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());
 
//middleware 
app.use(express.json());
app.use('/Orders', OrdersRoutes);
app.use('/Products', ProductsRoutes);
app.use('/StoreOwner', StoreOwnerRoutes);
app.use('/Suppliers', SuppliersRoutes);
app.use('/supply', supplyRoutes);



// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    //after conecting to db start listening to incoming requestes
    const PORT=process.env.PORT
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });
