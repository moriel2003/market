import { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Grid,
  Box
} from '@mui/material';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import ProductSelector from '../components/ProductSelector';

function SupplierSignup() {
  const [form, setForm] = useState({
    company_name: '', phone: '', representative_name: '', username: '', password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[key] = 'Required';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProducts = () => {
    let hasErr = false;
    const errMap = {};

    selectedProducts.forEach((p, i) => {
      const price_per_unit = parseFloat(p.price_per_unit);
      const qty = parseInt(p.minimum_quantity);
      const err = {};

      if (!price_per_unit || price_per_unit <= 0) err.price_per_unit = 'price_per_unit must be > 0';
      if (qty < 0 || isNaN(qty)) err.qty = 'Quantity must be ≥ 0';

      if (Object.keys(err).length > 0) {
        errMap[i] = err;
        hasErr = true;
      }
    });

    return !hasErr;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (selectedProducts.length > 0 && !validateProducts()) {
      return;
    }

    try {
      const supplier = {
        ...form,
        products: selectedProducts.map(p => ({
          product_name: p.product_name,
          price_per_unit: Number(p.price_per_unit),
          minimum_quantity: Number(p.minimum_quantity)
        }))
      };

      const res = await axios.post('/Suppliers', supplier);
      const supplierId = res.data._id;
      localStorage.setItem('supplierId', supplierId);

      const productsList = await axios.get('/Products');
      for (const p of selectedProducts) {
        const alreadyExists = productsList.data.some(prod => prod.name === p.product_name);
        if (!alreadyExists) {
          try {
            await axios.post('/Products', { name: p.product_name });
          } catch (err) {
            if (err?.response?.status !== 409) {
              console.error('Failed to add product to global DB:', err);
            }
          }
        }
      }

      navigate('/supplier/Orders');
    } catch (err) {
      const message = err?.response?.data?.error?.toLowerCase() || '';
      const updatedErrors = {};

      if (message.includes('username')) {
        updatedErrors.username = 'This username is already taken';
      }
      if (message.includes('phone')) {
        updatedErrors.phone = 'This phone number is already registered';
      }

      if (Object.keys(updatedErrors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...updatedErrors }));
      } else {
        alert('Signup failed. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Supplier Signup</Typography>

      <Grid container spacing={2}>
        {Object.keys(form).map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field.replace('_', ' ').toUpperCase()}
              name={field}
              type={field === 'password' ? 'password' : 'text'}
              value={form[field]}
              onChange={handleFormChange}
              error={!!formErrors[field]}
              helperText={formErrors[field]}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Add products you provide
        </Button>
      </Box>

      <Button variant="contained" sx={{ mt: 4 }} onClick={handleSubmit}>
        Sign Up
      </Button>

      <ProductSelector
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(products) => {
          setSelectedProducts(products);
          setOpen(false);
        }}
        initialSelected={selectedProducts}
        title="Select Products"
      />
    </Container>
  );
}

export default SupplierSignup;
