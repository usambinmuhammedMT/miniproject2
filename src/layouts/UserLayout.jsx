import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userRole');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white text-gray-800 shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/menu" className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-800">Foodie<span className="text-lime-600">Bites</span></span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden flex items-center p-2 rounded-md text-gray-600 hover:text-lime-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              }
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/menu" 
              className={`font-medium px-3 py-2 rounded-md transition-colors hover:text-lime-600 ${
                isActive('/menu') ? 'text-lime-600 bg-lime-50' : 'text-gray-700'
              }`}
            >
              Menu
            </Link>
            <Link 
              to="/cart" 
              className={`font-medium px-3 py-2 rounded-md transition-colors hover:text-lime-600 ${
                isActive('/cart') ? 'text-lime-600 bg-lime-50' : 'text-gray-700'
              }`}
            >
              Cart
            </Link>
            <Link 
              to="/orders" 
              className={`font-medium px-3 py-2 rounded-md transition-colors hover:text-lime-600 ${
                isActive('/orders') ? 'text-lime-600 bg-lime-50' : 'text-gray-700'
              }`}
            >
              My Orders
            </Link>
            <div className="flex items-center border-l pl-6 ml-2 border-gray-200">
              <div className="mr-4">
                <div className="text-sm text-gray-500">Welcome,</div>
                <div className="font-medium text-gray-800">{userName}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors shadow-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-2 pt-2 pb-4">
            <div className="space-y-1">
              <Link 
                to="/menu" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/menu') ? 'text-lime-600 bg-lime-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                to="/cart" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/cart') ? 'text-lime-600 bg-lime-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Cart
              </Link>
              <Link 
                to="/orders" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/orders') ? 'text-lime-600 bg-lime-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              <div className="pt-4 pb-2 border-t border-gray-200">
                <div className="flex items-center justify-between px-3">
                  <div>
                    <div className="text-sm text-gray-500">Welcome,</div>
                    <div className="font-medium text-gray-800">{userName}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-gray-800">FoodieBites</span>
              </div>
              <p className="text-sm mt-2">Delicious food delivered to your doorstep.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-lime-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-lime-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-lime-600 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p>© 2024 Food Ordering Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout; 