import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function ProductSelector({
  open,
  onClose,
  onSubmit,
  initialSelected = [],
  title = 'Add Products'
}) {
  const [productsList, setProductsList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productErrors, setProductErrors] = useState({});
  const [customProducts, setCustomProducts] = useState([{ name: '', price_per_unit: '', qty: '' }]);
  const [customError, setCustomError] = useState({});

  useEffect(() => {
    if (open) {
      axios.get('/Products')
        .then(res => setProductsList(res.data))
        .catch(console.error);

      // prefill selected products
      setSelectedProducts(initialSelected);
    }
  }, [open, initialSelected]);

  const toggleProduct = (name, checked) => {
    if (checked) {
      setSelectedProducts(prev => {
        const already = prev.find(p => p.product_name === name);
        return already
          ? prev
          : [...prev, { product_name: name, price_per_unit: '', minimum_quantity: '' }];
      });
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
    const price = parseFloat(field === 'price_per_unit' ? value : copy[i].price_per_unit);
    const qty = parseInt(field === 'minimum_quantity' ? value : copy[i].minimum_quantity);
    const err = {};

    if (!price || price <= 0) err.price_per_unit = 'Must be > 0';
    if (qty < 0 || isNaN(qty)) err.qty = 'Must be >= 0';

    if (Object.keys(err).length > 0) updatedErrors[i] = err;
    else delete updatedErrors[i];

    setProductErrors(updatedErrors);
  };

  const handleCustomChange = (i, e) => {
    const updated = [...customProducts];
    updated[i][e.target.name] = e.target.value;
    setCustomProducts(updated);

    if (
      updated[i].name.trim() &&
      updated[i].price_per_unit &&
      updated[i].qty &&
      i === customProducts.length - 1
    ) {
      setCustomProducts([...updated, { name: '', price_per_unit: '', qty: '' }]);
    }
  };

  const handleConfirm = () => {
    const validProducts = [...selectedProducts];
    const customErr = {};
    let hasErr = false;

    customProducts.forEach((prod, i) => {
      const name = prod.name.trim().toLowerCase();
      const price = parseFloat(prod.price_per_unit);
      const qty = parseInt(prod.qty);
      const err = {};

      if (!name && !price && !qty) return;
      if (!name) err.name = 'Required';
      if (productsList.some(p => p.name === name) || selectedProducts.some(p => p.product_name === name))
        err.name = 'Already listed';
      if (!price || price <= 0) err.price_per_unit = 'Enter valid price';
      if (qty < 0 || isNaN(qty)) err.qty = 'Enter valid quantity';

      if (Object.keys(err).length > 0) {
        customErr[i] = err;
        hasErr = true;
      } else {
        validProducts.push({
          product_name: name,
          price_per_unit: price,
          minimum_quantity: qty
        });
      }
    });

    if (hasErr) {
      setCustomError(customErr);
      return;
    }

    setCustomError({});
    onSubmit(validProducts);
    setSelectedProducts([]);
    setCustomProducts([{ name: '', price_per_unit: '', qty: '' }]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
          <Typography variant="subtitle1">Add your own products:</Typography>
          {customProducts.map((prod, i) => (
            <Grid container spacing={2} key={i} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Product Name"
                  name="name"
                  value={prod.name}
                  onChange={e => handleCustomChange(i, e)}
                  error={!!customError[i]?.name}
                  helperText={customError[i]?.name}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="price_per_unit"
                  type="number"
                  name="price_per_unit"
                  value={prod.price_per_unit}
                  onChange={e => handleCustomChange(i, e)}
                  error={!!customError[i]?.price_per_unit}
                  helperText={customError[i]?.price_per_unit}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Min Qty"
                  type="number"
                  name="qty"
                  value={prod.qty}
                  onChange={e => handleCustomChange(i, e)}
                  error={!!customError[i]?.qty}
                  helperText={customError[i]?.qty}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductSelector;
