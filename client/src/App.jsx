import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Supplier Pages
import SupplierSignup from './pages/SupplierSignup';
import Login from './pages/Login';
import Orders from './pages/Orders';

// Store Owner Pages
import StoreOwnerScreen from './pages/StoreOwnerScreen';
import CreateOrderScreen from './pages/CreateOrderScreen';

function App() {
  const supplierId = localStorage.getItem('supplierId');
  const storeOwnerId = localStorage.getItem('storeOwnerId');
return (
    <Router>
      <Routes>

        {/* Supplier Routes */}
        <Route path="/supplier/signup" element={<SupplierSignup />} />
        <Route path="/supplier/login" element={<Login isStoreOwner={false}  />} />
        <Route
          path="/supplier/Orders"
          element={supplierId ? <Orders /> : <Navigate to="/supplier/login" />}
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/login"
          element={<Login isStoreOwner={true} />}
        />
        <Route
          path="/store-owner"
          element={storeOwnerId ? <StoreOwnerScreen /> : <Navigate to="/store-owner/login" />}
        />
        <Route
          path="/store-owner/create-order"
          element={storeOwnerId ? <CreateOrderScreen /> : <Navigate to="/store-owner/login" />}
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/supplier/login" />} />

      </Routes>
    </Router>
  );
}

export default App;

