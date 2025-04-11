import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { API_URL } from '../config';
import { API_URL } from '../App';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalFoodItems: 0,
    pendingOrders: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch categories count
        const categoriesResponse = await fetch(`${API_URL}/categories/`);
        const categoriesData = await categoriesResponse.json();
        const totalCategories = categoriesData.count || categoriesData.length || 0;

        // Fetch food items count
        const foodItemsResponse = await fetch(`${API_URL}/food-items/`);
        const foodItemsData = await foodItemsResponse.json();
        const totalFoodItems = foodItemsData.count || foodItemsData.length || 0;

        // Fetch orders
        const ordersResponse = await fetch(`${API_URL}/orders/`);
        const ordersData = await ordersResponse.json();
        const orders = ordersData.results || ordersData || [];
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;

        // Get recent activity (last 5 orders)
        const recentOrders = orders
          .sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0))
          .slice(0, 5);

        setStats({
          totalCategories,
          totalFoodItems,
          pendingOrders,
          totalOrders
        });
        setRecentActivity(recentOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Component for stat card
  const StatCard = ({ title, value, icon, color, linkTo, linkText }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex p-5">
        <div className="mr-4">
          <div className={`p-3 bg-${color}-100 rounded-xl`}>
            {icon}
          </div>
        </div>
        <div>
          <div className="uppercase text-sm font-medium text-gray-500 mb-1">{title}</div>
          <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          {linkTo && (
            <Link to={linkTo} className={`text-${color}-600 text-sm hover:underline mt-1 inline-flex items-center`}>
              {linkText} 
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  // Component for action button
  const ActionButton = ({ title, icon, linkTo, color }) => (
    <Link
      to={linkTo}
      className={`flex items-center justify-center p-4 bg-${color}-50 text-${color}-700 rounded-xl hover:bg-${color}-100 transition-colors duration-200 group`}
    >
      <div className={`mr-3 p-2 bg-${color}-100 rounded-lg group-hover:bg-${color}-200 transition-colors duration-200`}>
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 my-8">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-gray-600 border border-gray-200 flex items-center">
          <svg className="h-5 w-5 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-lime-600 to-lime-500 rounded-xl shadow-md text-white p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Welcome to FoodieBites Admin</h2>
            <p className="opacity-90">Manage your food items, categories, and orders from one place.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              to="/admin/orders" 
              className="inline-flex items-center px-4 py-2 bg-white text-lime-700 rounded-lg hover:bg-lime-50 transition-colors duration-200 font-medium shadow-sm"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Review Pending Orders
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <svg className="h-5 w-5 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Key Metrics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Categories" 
          value={stats.totalCategories} 
          icon={
            <svg className="h-6 w-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          } 
          color="lime" 
          linkTo="/admin/categories" 
          linkText="Manage Categories"
        />
        
        <StatCard 
          title="Food Items" 
          value={stats.totalFoodItems} 
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          } 
          color="blue" 
          linkTo="/admin/food-items" 
          linkText="Manage Menu"
        />
        
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } 
          color="amber" 
          linkTo="/admin/orders" 
          linkText="Process Orders"
        />
        
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          } 
          color="purple" 
          linkTo="/admin/orders" 
          linkText="View All Orders"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="h-5 w-5 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="space-y-4">
              <ActionButton 
                title="Add Category" 
                icon={
                  <svg className="h-5 w-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                } 
                linkTo="/admin/categories" 
                color="lime"
              />
              
              <ActionButton 
                title="Add Food Item" 
                icon={
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                } 
                linkTo="/admin/food-items" 
                color="blue"
              />
              
              <ActionButton 
                title="Manage Orders" 
                icon={
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                } 
                linkTo="/admin/orders" 
                color="gray"
              />
              
              <ActionButton 
                title="View Invoices" 
                icon={
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                } 
                linkTo="/admin/invoices" 
                color="indigo"
              />
            </div>
          </div>
          
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="h-5 w-5 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              System Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-green-800">All Systems Operational</h3>
                  <p className="text-sm text-green-700">Your system is up to date and running smoothly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <svg className="h-5 w-5 mr-2 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Orders
            </h2>
            
            {recentActivity.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentActivity.map((order, index) => (
                      <tr key={order.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id || '--'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at || order.date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.user_name || order.customer || 'Anonymous'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {order.status || 'processing'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${order.total_amount || order.total || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Recent Orders</h3>
                <p className="text-gray-500">When customers place orders, they will appear here.</p>
              </div>
            )}
            
            {recentActivity.length > 0 && (
              <div className="mt-4 text-right">
                <Link to="/admin/orders" className="text-lime-600 hover:text-lime-700 font-medium">
                  View All Orders
                  <svg className="inline-block h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 