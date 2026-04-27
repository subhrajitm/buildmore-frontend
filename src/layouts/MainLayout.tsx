import React from 'react';
import { Header } from '../components/Header';
import { SubNav } from '../components/SubNav';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface MainLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  isHome?: boolean;
  noPadding?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, isDark, setIsDark, isHome, noPadding }) => {
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-yellow-400 selection:text-black ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'}`}>
      <Header isDark={isDark} setIsDark={setIsDark} />
      <SubNav isDark={isDark} />
      <main className={`max-w-[1920px] mx-auto w-full flex-1 ${noPadding ? '' : 'px-6 py-8 space-y-8'}`}>
        <ErrorBoundary isDark={isDark}>
          {children}
        </ErrorBoundary>
      </main>
      <Footer isDark={isDark} isHome={isHome} />
    </div>
  );
};