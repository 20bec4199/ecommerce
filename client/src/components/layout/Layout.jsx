import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../hooks/useTheme';


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('products');
  const { theme } = useTheme();

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'John Doe',
    avatar: '/profile-photo.jpg',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      
      <div className="lg:ml-0 flex flex-col min-h-screen">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;