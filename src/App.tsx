import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Landing } from './pages/Landing';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

export default function App() {
  const [isDark, setIsDark] = React.useState(true);

  return (
    <Router>
      <MainLayout isDark={isDark} setIsDark={setIsDark}>
        <Routes>
          <Route path="/" element={<Landing isDark={isDark} />} />
          <Route path="/products" element={<Products isDark={isDark} />} />
          <Route path="/product/:id" element={<ProductDetail isDark={isDark} />} />
          <Route path="/cart" element={<Cart isDark={isDark} />} />
          <Route path="/profile" element={<Profile isDark={isDark} />} />
          <Route path="/auth" element={<Auth isDark={isDark} />} />
           {/* Add catch-all or other technical placeholder pages */}
          <Route path="/inventory" element={<Products isDark={isDark} />} />
          <Route path="/logistics" element={<Profile isDark={isDark} />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
