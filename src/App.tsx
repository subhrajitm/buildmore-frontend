import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Admin } from './pages/Admin';
import { Landing } from './pages/Landing';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Inventory } from './pages/Inventory';
import { Logistics } from './pages/Logistics';
import { Compliance } from './pages/Compliance';
import { Specs } from './pages/Specs';
import { RFQs } from './pages/RFQs';

export default function App() {
  const [isDark, setIsDark] = React.useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout isDark={isDark} setIsDark={setIsDark}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing isDark={isDark} />} />
              <Route path="/products" element={<Products isDark={isDark} />} />
              <Route path="/product/:id" element={<ProductDetail isDark={isDark} />} />
              <Route path="/auth" element={<Auth isDark={isDark} />} />

              {/* Protected routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart isDark={isDark} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile isDark={isDark} /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory isDark={isDark} /></ProtectedRoute>} />
              <Route path="/logistics" element={<ProtectedRoute><Logistics isDark={isDark} /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><Compliance isDark={isDark} /></ProtectedRoute>} />
              <Route path="/specs" element={<ProtectedRoute><Specs isDark={isDark} /></ProtectedRoute>} />
              <Route path="/rfqs" element={<ProtectedRoute><RFQs isDark={isDark} /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><Admin isDark={isDark} /></AdminRoute>} />
            </Routes>
          </MainLayout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
