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
  const { isDark, isBoxed } = useTheme();
  const maxW = isBoxed ? 'max-w-7xl' : 'max-w-[1920px]';
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-yellow-400 selection:text-black ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <Header />
      <SubNav />
      <main className={`${maxW} mx-auto w-full flex-1 ${noPadding ? '' : 'px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8'}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer isHome={isHome} />
    </div>
  );
};
