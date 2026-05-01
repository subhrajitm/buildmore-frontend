import React from 'react';
import { Header } from '../components/Header';
import { SubNav } from '../components/SubNav';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useTheme } from '../context/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  isHome?: boolean;
  noPadding?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, isHome, noPadding }) => {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-yellow-400 selection:text-black ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <Header />
      <SubNav />
      <main className={`max-w-[1920px] mx-auto w-full flex-1 ${noPadding ? '' : 'px-3 lg:px-6 py-4 lg:py-8 space-y-6 lg:space-y-8'}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer isHome={isHome} />
    </div>
  );
};
