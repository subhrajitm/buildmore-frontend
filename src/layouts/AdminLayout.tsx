import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Truck,
  LogOut, Building2, Layers, Menu, X
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Layers, label: 'Categories' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/rfqs', icon: FileText, label: 'RFQs' },
  { path: '/admin/shipments', icon: Truck, label: 'Shipments' },
];

export const AdminLayout: React.FC = () => {
  const { adminUser, adminLogout, isAdminAuthenticated } = useAdminAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const bgClass = isDark ? 'bg-black' : 'bg-slate-50';
  const sidebarBg = isDark ? 'bg-zinc-900 border-r border-white/5' : 'bg-white border-r border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';

  if (!isAdminAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass}`}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${bgClass}`}>
      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden absolute top-4 left-4 z-50 p-2 rounded-lg bg-yellow-400"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
      </button>

      {/* Sidebar */}
      <aside className={`w-64 flex-shrink-0 ${sidebarBg} flex flex-col fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-dashed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className={`text-sm font-black uppercase tracking-wider ${textClass}`}>BuildMore</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass}`}>Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-black'
                    : `${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dashed">
          <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass} mb-1`}>Logged in as</p>
            <p className={`text-xs font-bold truncate ${textClass}`}>{adminUser?.name || 'Admin'}</p>
            <p className={`text-[9px] truncate ${mutedClass}`}>{adminUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              isDark ? 'bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0 ml-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="p-4 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};
