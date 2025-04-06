
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, LogOut, Menu, Users, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header */}
      <header className="bg-white shadow-sm h-16 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link to="/dashboard" className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-factory-blue" />
              <span className="font-bold text-lg hidden md:inline">Factory Tasks</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-sm w-64 fixed top-16 bottom-0 z-20 transition-transform duration-300 ${
            isMobile ? 
              (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 
              'translate-x-0'
          }`}
        >
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          
          <div className="p-4">
            <div className="mb-6">
              <h3 className="font-medium text-sm text-gray-500 uppercase">Main Menu</h3>
              <nav className="mt-3 space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={closeSidebar}
                >
                  <CheckSquare className="h-5 w-5 text-factory-blue" />
                  <span>My Tasks</span>
                </Link>
                
                {user?.role === 'management' && (
                  <Link
                    to="/dashboard/workers"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={closeSidebar}
                  >
                    <Users className="h-5 w-5 text-factory-blue" />
                    <span>Worker Management</span>
                  </Link>
                )}
              </nav>
            </div>

            <Separator />

            <div className="mt-6">
              <h3 className="font-medium text-sm text-gray-500 uppercase">Account</h3>
              <nav className="mt-3 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700">
                  <User className="h-5 w-5 text-factory-blue" />
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
                
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 text-factory-blue" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Darkened overlay when mobile sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-10" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className={`flex-1 p-6 ${!isMobile ? 'ml-64' : ''} transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
