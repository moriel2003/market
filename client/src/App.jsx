import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupplierSignup from './pages/SupplierSignup';
import Login from './pages/Login';
import Orders from './pages/Orders';
import StoreOwnerScreen from './pages/StoreOwnerScreen';
import CreateOrderScreen from './pages/CreateOrderScreen'; // ✅


function App() {
  const supplierId = localStorage.getItem('supplierId');

  return (
    <Router>
      <Routes>
        <Route path="/SupplierSignup" element={<SupplierSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={supplierId ? <Orders /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/store-owner" element={<StoreOwnerScreen />} />
        <Route path="/store/create-order" element={<CreateOrderScreen />} /> {/* ✅ new route */}

      </Routes>
    </Router>
  );
}

export default App;
