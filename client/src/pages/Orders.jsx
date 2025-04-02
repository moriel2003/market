import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosInstance';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const supplierId = localStorage.getItem('supplierId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/Orders');
        const filtered = Array.isArray(res.data)
          ? res.data.filter(order => order.supplier_id === supplierId)
          : [];
        setOrders(filtered);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [supplierId]);

  const handleStatusChange = async (orderId) => {
    try {
      await axios.patch(`/Orders/${orderId}`, { status: 'In Process' });
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: 'In Process' } : order
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`/Orders/${orderId}`);
      setSelectedOrder(res.data);
      setDialogOpen(true);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Order Number</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography
                      sx={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                      onClick={() => openOrderDetails(order._id)}
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        onChange={() => handleStatusChange(order._id)}
                        checked={order.status === 'In Process'}
                        disabled={order.status !== 'Pending Approval'}
                      />
                      <Typography variant="body2">
                        {order.status === 'In Process' ? 'Approved' : 'Pending'}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Order Details
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</Typography>

              <Typography sx={{ mt: 2, mb: 1 }}><strong>Items:</strong></Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell><strong>Quantity</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Orders;
