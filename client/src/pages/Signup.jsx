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

function Signup() {
  const [form, setForm] = useState({
    company_name: '',
    phone: '',
    representative_name: '',
    username: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/Suppliers', form);
      localStorage.setItem('supplierId', res.data._id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
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
            Supplier Signup
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Company Name"
              name="company_name"
              fullWidth
              value={form.company_name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              value={form.phone}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Representative Name"
              name="representative_name"
              fullWidth
              value={form.representative_name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
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
              Sign Up
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover">
              Log in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;
