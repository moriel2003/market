import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
  Grid,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/Suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    }
  };

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    const supplier = suppliers.find((s) => s._id === supplierId);
    setProducts(supplier?.products || []);
    setQuantities({});
    setErrors({});
    setOrderSuccess(false);
  };

  const handleQuantityChange = (productName, value) => {
    const intValue = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [productName]: intValue }));
    setErrors((prev) => ({ ...prev, [productName]: false }));
    setOrderSuccess(false);
  };

  const validateInputs = () => {
    const newErrors = {};
    let isValid = false;

    products.forEach((prod) => {
      const quantity = quantities[prod.product_name];
      if (quantity && quantity >= prod.minimum_quantity) {
        isValid = true;
      } else if (quantity !== undefined) {
        newErrors[prod.product_name] = true;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) return;
    if (!validateInputs()) return;

    const orderItems = products
      .filter((prod) => {
        const quantity = quantities[prod.product_name];
        return quantity >= prod.minimum_quantity;
      })
      .map((prod) => ({
        product_name: prod.product_name,
        quantity: quantities[prod.product_name],
        price: prod.price_per_unit,
      }));

    try {
      await axios.post('/Orders', {
        supplier_id: selectedSupplier,
        items: orderItems,
      });

      setOrderSuccess(true);
      setQuantities({});
      setErrors({});
    } catch (err) {
      console.error('Failed to submit order', err);
    }
  };

  const calculateTotal = () => {
    return products.reduce((total, prod) => {
      const qty = quantities[prod.product_name] || 0;
      return total + qty * prod.price_per_unit;
    }, 0);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Order
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Supplier</InputLabel>
        <Select value={selectedSupplier} onChange={handleSupplierChange} label="Supplier">
          {suppliers.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.company_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {products.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Products
          </Typography>

          <Grid container spacing={2}>
            {products.map((prod) => (
              <Grid item xs={12} sm={6} md={4} key={prod.product_name}>
                <TextField
                  label={`Quantity (min ${prod.minimum_quantity})`}
                  type="number"
                  fullWidth
                  value={quantities[prod.product_name] || ''}
                  onChange={(e) => handleQuantityChange(prod.product_name, e.target.value)}
                  error={errors[prod.product_name]}
                  helperText={
                    errors[prod.product_name]
                      ? `Minimum is ${prod.minimum_quantity}`
                      : `₪ ${prod.price_per_unit.toFixed(2)}`
                  }
                />
                <Typography sx={{ mt: 1 }}>{prod.product_name}</Typography>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Total: ₪ {calculateTotal().toFixed(2)}
          </Typography>

          {orderSuccess && (
            <>
              <Typography sx={{ color: 'green', mt: 2 }}>
                Order submitted successfully!
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => navigate('/store-owner')}
              >
                Back to Orders
              </Button>
            </>
          )}

          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
            Submit Order
          </Button>
        </>
      )}
    </Container>
  );
}

export default CreateOrder;
