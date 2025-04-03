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

function SupplierSignup() {
  const [form, setForm] = useState({
    company_name: '',
    phone: '',
    representative_name: '',
    username: '',
    password: ''
  });

  const [productsList, setProductsList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductErrors, setSelectedProductErrors] = useState({});
  const [otherProduct, setOtherProduct] = useState({ name: '', price: '', qty: '' });
  const [otherError, setOtherError] = useState({ name: '', price: '', qty: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/Products');
        setProductsList(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProductCheck = (productName, checked) => {
    if (checked) {
      setSelectedProducts(prev => [
        ...prev,
        { product_name: productName, price : '', minimum_quantity: '' }
      ]);
    } else {
      setSelectedProducts(prev =>
        prev.filter(p => p.product_name !== productName)
      );
    }
  };

  const handleProductInputChange = (index, field, value) => {
    setSelectedProducts(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setOtherProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleProductsSubmit = () => {
    const name = otherProduct.name.trim().toLowerCase();
    const price = parseFloat(otherProduct.price);
    const qty = parseInt(otherProduct.qty);

    setOtherError({ name: '', price: '', qty: '' });
    setSelectedProductErrors({});

    let hasError = false;

    if (name) {
      const nameExistsInSystem = productsList.some(p => p.name === name);
      const nameExistsInSelected = selectedProducts.some(p => p.product_name === name);

      if (nameExistsInSystem || nameExistsInSelected) {
        setOtherError(prev => ({ ...prev, name: `"${name}" is already listed` }));
        hasError = true;
      }

      if (isNaN(price) || price <= 0) {
        setOtherError(prev => ({ ...prev, price: 'Enter valid price > 0' }));
        hasError = true;
      }

      if (isNaN(qty) || qty <= 0) {
        setOtherError(prev => ({ ...prev, qty: 'Enter valid quantity > 0' }));
        hasError = true;
      }
    }

    // ✅ Validate all selected products
    let productErrors = {};
    let productHasError = false;

    selectedProducts.forEach((item, index) => {
      const itemPrice = parseFloat(item.price);
      const itemQty = parseInt(item.minimum_quantity);

      // Validate price
      if (item.price === '' || isNaN(itemPrice) || itemPrice <= 0) {
        productErrors[index] = productErrors[index] || {};
        productErrors[index].price = 'Price must be > 0';
        productHasError = true;
      }

      // Validate quantity
      if (item.minimum_quantity === '' || isNaN(itemQty) || itemQty <= 0) {
        productErrors[index] = productErrors[index] || {};
        productErrors[index].qty = 'Quantity must be > 0';
        productHasError = true;
      }
    });

    setSelectedProductErrors(productErrors);

    if (hasError || productHasError) return;

    if (name) {
      setSelectedProducts(prev => [
        ...prev,
        {
          product_name: name,
          price: price,
          minimum_quantity: qty
        }
      ]);
      setOtherProduct({ name: '', price: '', qty: '' });
    }

    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/Suppliers', {
        ...form,
        products: selectedProducts
      });
      alert('Supplier registered successfully!');
    } catch (err) {
      console.error('Signup failed:', err);
      alert('Signup failed');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Supplier Signup</Typography>

      <Grid container spacing={2}>
        {['company_name', 'phone', 'representative_name', 'username', 'password'].map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field.replace('_', ' ').toUpperCase()}
              name={field}
              type={field === 'password' ? 'password' : 'text'}
              value={form[field]}
              onChange={handleFormChange}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => setDialogOpen(true)}>
          Add products you provide
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={handleSubmit}
      >
        Sign Up
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Select Products You Provide
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'gray' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="subtitle1">Choose from existing products:</Typography>
          {productsList.map(product => {
            const selectedIndex = selectedProducts.findIndex(p => p.product_name === product.name);
            const selected = selectedIndex !== -1;

            return (
              <Box key={product._id} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected}
                      onChange={(e) => handleProductCheck(product.name, e.target.checked)}
                    />
                  }
                  label={product.name}
                />
                {selected && (
                  <Grid container spacing={1} sx={{ pl: 4 }}>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Price Per Unit"
                        type="number"
                        size="small"
                        value={selectedProducts[selectedIndex].price}
                        onChange={(e) =>
                          handleProductInputChange(selectedIndex, 'price', e.target.value)
                        }
                        error={!!selectedProductErrors[selectedIndex]?.price}
                        helperText={selectedProductErrors[selectedIndex]?.price}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Min Quantity"
                        type="number"
                        size="small"
                        value={selectedProducts[selectedIndex].minimum_quantity}
                        onChange={(e) =>
                          handleProductInputChange(selectedIndex, 'minimum_quantity', e.target.value)
                        }
                        error={!!selectedProductErrors[selectedIndex]?.qty}
                        helperText={selectedProductErrors[selectedIndex]?.qty}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            );
          })}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1">Other Product</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Product Name"
                  name="name"
                  value={otherProduct.name}
                  onChange={handleOtherChange}
                  error={!!otherError.name}
                  helperText={otherError.name}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Price"
                  type="number"
                  name="price"
                  value={otherProduct.price}
                  onChange={handleOtherChange}
                  error={!!otherError.price}
                  helperText={otherError.price}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Min Qty"
                  type="number"
                  name="qty"
                  value={otherProduct.qty}
                  onChange={handleOtherChange}
                  error={!!otherError.qty}
                  helperText={otherError.qty}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleProductsSubmit} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SupplierSignup;
