import { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function SupplierSignup() {
  const [form, setForm] = useState({
    company_name: '', phone: '', representative_name: '', username: '', password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productErrors, setProductErrors] = useState({});
  const [customProduct, setCustomProduct] = useState({ name: '', price_per_unit: '', qty: '' });
  const [customError, setCustomError] = useState({});
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/Products').then(res => setProductsList(res.data)).catch(console.error);
  }, []);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const toggleProduct = (name, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, { product_name: name, price_per_unit: '', minimum_quantity: '' }]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.product_name !== name));
      setProductErrors(prev => {
        const updated = { ...prev };
        const index = selectedProducts.findIndex(p => p.product_name === name);
        delete updated[index];
        return updated;
      });
    }
  };

  const updateProductField = (i, field, value) => {
    const copy = [...selectedProducts];
    copy[i][field] = value;
    setSelectedProducts(copy);

    const updatedErrors = { ...productErrors };
    const price_per_unit = parseFloat(field === 'price_per_unit' ? value : copy[i].price_per_unit);
    const qty = parseInt(field === 'minimum_quantity' ? value : copy[i].minimum_quantity);
    const err = {};

    if (!price_per_unit || price_per_unit <= 0) err.price_per_unit = 'price_per_unit must be > 0';
    if (qty < 0 || isNaN(qty)) err.qty = 'Quantity must be ≥ 0';

    if (Object.keys(err).length > 0) {
      updatedErrors[i] = err;
    } else {
      delete updatedErrors[i];
    }

    setProductErrors(updatedErrors);
  };

  const handleCustomChange = e => {
    setCustomProduct({ ...customProduct, [e.target.name]: e.target.value });
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

    setProductErrors(errMap);
    return !hasErr;
  };

  const handleAddCustomProduct = () => {
    const name = customProduct.name.trim().toLowerCase();
    const price_per_unit = parseFloat(customProduct.price_per_unit);
    const qty = parseInt(customProduct.qty);
    const errors = {};

    if (!name) {
      setOpen(false);
      setCustomProduct({ name: '', price_per_unit: '', qty: '' });
      setCustomError({});
      return;
    }

    if (productsList.some(p => p.name === name) || selectedProducts.some(p => p.product_name === name)) {
      errors.name = 'Name is already listed';
    }
    if (!price_per_unit || price_per_unit <= 0) errors.price_per_unit = 'Enter valid price_per_unit';
    if (qty < 0 || isNaN(qty)) errors.qty = 'Enter valid quantity';

    if (Object.keys(errors).length > 0) {
      setCustomError(errors);
      return;
    }

    setSelectedProducts([...selectedProducts, {
      product_name: name,
      price_per_unit_per_unit: price_per_unit,

      minimum_quantity: qty
    }]);

    setCustomProduct({ name: '', price_per_unit: '', qty: '' });
    setCustomError({});
    setOpen(false);
  };

const handleSubmit = async () => {
  if (!validateForm() || !validateProducts()) return;
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
    
    localStorage.setItem('supplierId', res.data._id);
    navigate('/supplier/Orders');
  } catch (err) {
    const message = err?.response?.data?.message || '';
    if (message.toLowerCase().includes('username')) {
      setFormErrors(prev => ({ ...prev, username: 'Username may already be taken' }));
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Select Products
          <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1">Choose existing products:</Typography>
          {productsList.map(product => {
            const index = selectedProducts.findIndex(p => p.product_name === product.name);
            const selected = index !== -1;
            return (
              <Box key={product._id} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={selected} onChange={e => toggleProduct(product.name, e.target.checked)} />}
                  label={product.name}
                />
                {selected && (
                  <Grid container spacing={1} sx={{ pl: 4 }}>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="price_per_unit"
                        type="number"
                        size="small"
                        value={selectedProducts[index].price_per_unit}
                        onChange={e => updateProductField(index, 'price_per_unit', e.target.value)}
                        error={!!productErrors[index]?.price_per_unit}
                        helperText={productErrors[index]?.price_per_unit}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Min Qty"
                        type="number"
                        size="small"
                        value={selectedProducts[index].minimum_quantity}
                        onChange={e => updateProductField(index, 'minimum_quantity', e.target.value)}
                        error={!!productErrors[index]?.qty}
                        helperText={productErrors[index]?.qty}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            );
          })}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1">Add your own product:</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Product Name"
                  name="name"
                  value={customProduct.name}
                  onChange={handleCustomChange}
                  error={!!customError.name}
                  helperText={customError.name}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="price_per_unit"
                  type="number"
                  name="price_per_unit"
                  value={customProduct.price_per_unit}
                  onChange={handleCustomChange}
                  error={!!customError.price_per_unit}
                  helperText={customError.price_per_unit}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Min Qty"
                  type="number"
                  name="qty"
                  value={customProduct.qty}
                  onChange={handleCustomChange}
                  error={!!customError.qty}
                  helperText={customError.qty}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddCustomProduct} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SupplierSignup;
