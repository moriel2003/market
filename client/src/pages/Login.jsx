import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axiosInstance';

function Login({ isStoreOwner }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    const endpoint = isStoreOwner ? '/StoreOwner/login' : '/Suppliers/login';

    try {
      const res = await axios.post(endpoint, { username, password });
      const userId = res.data._id;

      if (isStoreOwner) {
        localStorage.setItem('storeOwnerId', userId);
        navigate('/store-owner');
      } else {
        localStorage.setItem('supplierId', userId);
        navigate('/supplier/orders');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {isStoreOwner ? 'Store Owner Login' : 'Supplier Login'}
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>
        {!isStoreOwner && (
          <Typography variant="body2" align="center">
            Don’t have an account? <Link to="/supplier/signup">Sign up</Link>
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default Login;