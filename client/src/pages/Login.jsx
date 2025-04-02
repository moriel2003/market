import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/Suppliers/login', form);
      localStorage.setItem('supplierId', res.data._id);
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ padding: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Supplier Login
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              label="Username"
              name="username"
              fullWidth
              value={form.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don&apos;t have an account?{' '}
            <Link href="/SupplierSignup" underline="hover">
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
