import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-lime-600 text-white py-4 px-6 shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <Link to="/admin/dashboard" className="text-xl font-bold">Foodie Admin</Link>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-white text-lime-700 px-4 py-2 rounded-full hover:bg-lime-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm fixed h-full">
          <nav className="p-4 h-full">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'bg-lime-100 text-lime-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
              </li>
              
              <li className="pt-3 pb-1">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase">Food Management</div>
              </li>
              
              <li>
                <Link
                  to="/admin/categories"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/categories')
                      ? 'bg-lime-100 text-lime-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categories
                </Link>
              </li>
              
              <li>
                <Link
                  to="/admin/food-items"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/food-items')
                      ? 'bg-lime-100 text-lime-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Food Items
                </Link>
              </li>
              
              <li className="pt-3 pb-1">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase">Order Management</div>
              </li>
              
              <li>
                <Link
                  to="/admin/orders"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/orders')
                      ? 'bg-lime-100 text-lime-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </Link>
              </li>
              
              <li>
                <Link
                  to="/admin/invoices"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/invoices')
                      ? 'bg-lime-100 text-lime-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Invoices
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 ml-64 p-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 py-4 text-center ml-64">
        <div className="container mx-auto px-6">
          <p>© 2024 Food Ordering Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout; 