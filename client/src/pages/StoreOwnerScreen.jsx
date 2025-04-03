import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosInstance';

function StoreOwnerScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [suppliersList, setSuppliersList] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, supplierFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/Orders');
      setOrders(res.data);
      const uniqueSuppliers = [...new Set(res.data.map(o => o.supplier_name).filter(Boolean))];
      setSuppliersList(uniqueSuppliers);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const applyFilters = () => {
    let data = [...orders];

    if (statusFilter !== 'All') {
      data = data.filter(order => order.status === statusFilter);
    }

    if (supplierFilter !== 'All') {
      data = data.filter(order => order.supplier_name === supplierFilter);
    }

    if (sortBy === 'date') {
      data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    } else if (sortBy === 'supplier') {
      data.sort((a, b) =>
        (a.supplier_name || '').localeCompare(b.supplier_name || '')
      );
    }

    setFilteredOrders(data);
  };

  const handleStatusChange = async (orderId) => {
    try {
      await axios.patch(`/Orders/${orderId}`, { status: 'Completed' });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const openPopup = (order) => {
    setSelectedOrder(order);
    setPopupOpen(true);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Pending Approval': return 'default';
      case 'In Process': return 'warning';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const calculateTotal = () => {
    if (!selectedOrder?.items) return '0.00';
    return selectedOrder.items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Store Owner Screen</Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending Approval">Pending Approval</MenuItem>
            <MenuItem value="In Process">In Process</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="supplier">Supplier</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ minWidth: 220 }}>
          <InputLabel>Choose Supplier</InputLabel>
          <Select value={supplierFilter} label="Choose Supplier" onChange={(e) => setSupplierFilter(e.target.value)}>
            <MenuItem value="All">All Suppliers</MenuItem>
            {suppliersList.map((name, idx) => (
              <MenuItem key={idx} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order #</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Mark as Completed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.map((order, index) => (
            <TableRow key={order._id}>
              <TableCell
                sx={{ cursor: 'pointer', color: 'blue' }}
                onClick={() => openPopup(order)}
              >
                {index + 1}
              </TableCell>
              <TableCell>{order.supplier_name}</TableCell>
              <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
              <TableCell>
                <Chip label={order.status} color={getStatusChipColor(order.status)} size="small" />
              </TableCell>
              <TableCell>
                {order.status === 'In Process' && (
                  <Checkbox onChange={() => handleStatusChange(order._id)} checked={false} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredOrders.length === 0 && (
        <Typography sx={{ mt: 2 }}>No orders found.</Typography>
      )}

      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details
          <IconButton
            aria-label="close"
            onClick={() => setPopupOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography><strong>Supplier:</strong> {selectedOrder.supplier_name}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</Typography>

              <Box display="flex" alignItems="center" mt={1}>
                <Typography><strong>Status:</strong></Typography>
                <Chip
                  label={selectedOrder.status}
                  color={getStatusChipColor(selectedOrder.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>


              <Typography sx={{ mt: 3 }}><strong>Order Items:</strong></Typography>
              

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price per Unit</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price?.toFixed(2) ?? 'N/A'}</TableCell>
                      <TableCell>{(item.quantity * item.price)?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}><strong>Total</strong></TableCell>
                    <TableCell><strong>{calculateTotal()} ₪</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPopupOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StoreOwnerScreen;
