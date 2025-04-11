import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Pages
import CategoryPage from './pages/admin/ManageCategory';
import FoodItemsPage from './pages/admin/FooditemsPage';
import ManageOrders from './pages/admin/ManageOrders';
// import ManageInvoices from './pages/invoices/ManageInvoices';

// User Pages
import Menu from './pages/user/Menu';
import Cart from './pages/user/Cart';
import OrderHistory from './pages/user/OrderHistory';
import CheckoutPage from './pages/CheckoutPage';
import UserLayout from './layouts/UserLayout';

export const API_URL = 'http://localhost:8000/api'; 


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check for authentication status when app loads
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';

    setIsAuthenticated(auth);
    setUserRole(role);
  }, []);

  // NotFound component for 404 pages
  const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-lime-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Page not found</p>
        <button 
          onClick={() => window.history.back()} 
          className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/menu'} replace />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
              )
            }
          />

          {/* User Routes */}
          <Route path="/" element={
            isAuthenticated && userRole === 'user' ? (
              <UserLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }>
            <Route index element={<Navigate to="/menu" replace />} />
            <Route path="menu" element={<Menu />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>

          {/* Checkout route - separate from UserLayout for a cleaner checkout experience */}
          <Route
            path="/checkout"
            element={
              isAuthenticated && userRole === 'user' ? (
                <CheckoutPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={
            isAuthenticated && userRole === 'admin' ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="categories" element={<CategoryPage />} />
            <Route path="food-items" element={<FoodItemsPage />} />
            <Route path="orders" element={<ManageOrders />} />
            {/* <Route path="invoices" element={<ManageInvoices />} /> */}
          </Route>

          {/* Fallback routes */}
          <Route path="/404" element={<NotFound />} />
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/menu'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;
