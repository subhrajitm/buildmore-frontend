import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';

// Lazy-loaded pages — each route is a separate chunk
const AdminLogin      = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts   = lazy(() => import('./pages/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AddProduct      = lazy(() => import('./pages/AddProduct').then(m => ({ default: m.AddProduct })));
const AdminOrders     = lazy(() => import('./pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminRFQs       = lazy(() => import('./pages/AdminRFQs').then(m => ({ default: m.AdminRFQs })));
const AdminShipments  = lazy(() => import('./pages/AdminShipments').then(m => ({ default: m.AdminShipments })));
const AdminCategories = lazy(() => import('./pages/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminSettings   = lazy(() => import('./pages/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminBanners    = lazy(() => import('./pages/AdminBanners').then(m => ({ default: m.AdminBanners })));
const AdminOffers     = lazy(() => import('./pages/AdminOffers').then(m => ({ default: m.AdminOffers })));

const Landing         = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Products        = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail   = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart            = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout        = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Profile         = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Auth            = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Inventory       = lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })));
const Logistics       = lazy(() => import('./pages/Logistics').then(m => ({ default: m.Logistics })));
const Compliance      = lazy(() => import('./pages/Compliance').then(m => ({ default: m.Compliance })));
const Specs           = lazy(() => import('./pages/Specs').then(m => ({ default: m.Specs })));
const RFQs            = lazy(() => import('./pages/RFQs').then(m => ({ default: m.RFQs })));
const AllCategories   = lazy(() => import('./pages/AllCategories').then(m => ({ default: m.AllCategories })));
const Wishlist        = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const NotFound        = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<MainLayout isHome><Landing /></MainLayout>} />
                    <Route path="/products" element={<MainLayout noPadding><Products /></MainLayout>} />
                    <Route path="/products/categories" element={<MainLayout noPadding><AllCategories /></MainLayout>} />
                    <Route path="/products/:categorySlug" element={<MainLayout noPadding><Products /></MainLayout>} />
                    <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
                    <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
                    <Route path="/specs" element={<MainLayout><Specs /></MainLayout>} />
                    <Route path="/auth" element={<MainLayout><Auth /></MainLayout>} />

                    <Route path="/cart" element={<MainLayout><ProtectedRoute><Cart /></ProtectedRoute></MainLayout>} />
                    <Route path="/checkout" element={<MainLayout><ProtectedRoute><Checkout /></ProtectedRoute></MainLayout>} />
                    <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
                    <Route path="/logistics" element={<MainLayout><ProtectedRoute><Logistics /></ProtectedRoute></MainLayout>} />
                    <Route path="/compliance" element={<MainLayout><ProtectedRoute><Compliance /></ProtectedRoute></MainLayout>} />
                    <Route path="/rfqs" element={<MainLayout><ProtectedRoute><RFQs /></ProtectedRoute></MainLayout>} />
                    <Route path="/wishlist" element={<MainLayout><ProtectedRoute><Wishlist /></ProtectedRoute></MainLayout>} />

                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="login" element={<AdminLogin />} />
                      <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                      <Route path="products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
                      <Route path="categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
                      <Route path="products/add" element={<AdminProtectedRoute><AddProduct /></AdminProtectedRoute>} />
                      <Route path="orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
                      <Route path="rfqs" element={<AdminProtectedRoute><AdminRFQs /></AdminProtectedRoute>} />
                      <Route path="shipments" element={<AdminProtectedRoute><AdminShipments /></AdminProtectedRoute>} />
                      <Route path="banners" element={<AdminProtectedRoute><AdminBanners /></AdminProtectedRoute>} />
                      <Route path="offers" element={<AdminProtectedRoute><AdminOffers /></AdminProtectedRoute>} />
                      <Route path="settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </ToastProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
