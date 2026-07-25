import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import NotificationToast from '../components/common/NotificationToast';

const MainLayout = ({ children, activePage, setActivePage, onAddTripClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5f4f0] dark:bg-[#080b10] travel-os-grid text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Sidebar - Collapses on mobile, permanent on desktop */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 bg-transparent">
        {/* Header toolbar */}
        <Header 
          activePage={activePage} 
          onMenuClick={() => setSidebarOpen(true)} 
          onAddTripClick={onAddTripClick}
        />

        {/* Dynamic page container */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Notifications */}
      <NotificationToast />
    </div>
  );
};

export default MainLayout;
