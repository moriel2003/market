import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupplierSignup from './pages/SupplierSignup';
import Login from './pages/Login';
import Orders from './pages/Orders';


function App() {
  const supplierId = localStorage.getItem('supplierId');

  return (
    <Router>
      <Routes>
        <Route path="/SupplierSignup" element={<SupplierSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={supplierId ? <Orders /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
