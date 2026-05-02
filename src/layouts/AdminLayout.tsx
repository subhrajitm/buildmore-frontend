import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Truck,
  LogOut, Building2, Layers, Settings, Menu, X, Image as ImageIcon, Percent
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Layers, label: 'Categories' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/rfqs', icon: FileText, label: 'RFQs' },
  { path: '/admin/shipments', icon: Truck, label: 'Shipments' },
  { path: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { path: '/admin/offers', icon: Percent, label: 'Offers' },
  { path: '/admin/settings', icon: Settings, label: 'Other Fees' },
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
  const sidebarBg = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200';
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
    <div className={`flex h-screen overflow-hidden ${bgClass}`}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 flex flex-col border-r
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarBg}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo row */}
        <div className="p-5 border-b border-dashed flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className={`text-sm font-black uppercase tracking-wider ${textClass}`}>BuildMore</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${mutedClass}`}>Admin Portal</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-black'
                    : `${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-dashed p-4 shrink-0">
          <div className={`p-4 rounded-xl mb-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className={`lg:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0 ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-black" />
            </div>
            <span className={`text-sm font-black uppercase tracking-wider ${textClass}`}>
              Build<span className="text-yellow-400">More</span>
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              Admin
            </span>
          </div>
          <div className="ml-auto">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${isDark ? 'bg-zinc-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {adminUser?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

      </div>
    </div>
  );
};
