import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AddProduct } from './pages/AddProduct';
import { AdminOrders } from './pages/AdminOrders';
import { AdminRFQs } from './pages/AdminRFQs';
import { AdminShipments } from './pages/AdminShipments';
import { AdminCategories } from './pages/AdminCategories';

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
import { NotFound } from './pages/NotFound';

export default function App() {
  const [isDark, setIsDark] = React.useState(true);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark} isHome>
                  <Landing isDark={isDark} />
                </MainLayout>
              } />
              <Route path="/products" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <Products isDark={isDark} />
                </MainLayout>
              } />
              <Route path="/product/:id" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProductDetail isDark={isDark} />
                </MainLayout>
              } />
              <Route path="/inventory" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <Inventory isDark={isDark} />
                </MainLayout>
              } />
              <Route path="/specs" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <Specs isDark={isDark} />
                </MainLayout>
              } />
              
              <Route path="/auth" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <Auth isDark={isDark} />
                </MainLayout>
              } />
              
              <Route path="/cart" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProtectedRoute><Cart isDark={isDark} /></ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/profile" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProtectedRoute><Profile isDark={isDark} /></ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/logistics" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProtectedRoute><Logistics isDark={isDark} /></ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/compliance" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProtectedRoute><Compliance isDark={isDark} /></ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/rfqs" element={
                <MainLayout isDark={isDark} setIsDark={setIsDark}>
                  <ProtectedRoute><RFQs isDark={isDark} /></ProtectedRoute>
                </MainLayout>
              } />
              

              <Route path="/admin" element={<AdminLayout isDark={isDark} />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="login" element={<AdminLogin isDark={isDark} />} />
                <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="products" element={<AdminProtectedRoute><AdminProducts isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="categories" element={<AdminProtectedRoute><AdminCategories isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="products/add" element={<AdminProtectedRoute><AddProduct isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="orders" element={<AdminProtectedRoute><AdminOrders isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="rfqs" element={<AdminProtectedRoute><AdminRFQs isDark={isDark} /></AdminProtectedRoute>} />
                <Route path="shipments" element={<AdminProtectedRoute><AdminShipments isDark={isDark} /></AdminProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound isDark={isDark} />} />
            </Routes>
          </Router>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}