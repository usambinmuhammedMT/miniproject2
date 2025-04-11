import React, { useState, useEffect } from 'react';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userRole');
  const { showErrorAlert } = useModal();

  // Fetch order history
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/orders/?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        setOrders(data.results || data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Fetch order details
  const viewOrderDetails = async (orderId) => {
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      showErrorAlert('Error', 'Failed to load order details. Please try again.');
    }
  };

  // Print invoice
  const printInvoice = () => {
    window.print();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="text-center my-8">Loading order history...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center my-8">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center my-12">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container, .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <h1 className="text-3xl font-bold mb-6 no-print">Order History</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden no-print">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Order ID</th>
              <th className="py-3 px-4 text-left font-semibold">Date</th>
              <th className="py-3 px-4 text-left font-semibold">Total</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{order.order_id}</td>
                  <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                  <td className="py-3 px-4">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      className="text-lime-600 hover:text-lime-800 mr-3"
                    >
                      {selectedOrder && selectedOrder.id === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                
                {selectedOrder && selectedOrder.id === order.id && (
                  <tr>
                    <td colSpan="5" className="bg-gray-50 p-6">
                      <div className="border rounded-lg overflow-hidden bg-white shadow-sm invoice-container">
                        {/* Invoice Header */}
                        <div className="bg-lime-50 p-4 border-b">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Order Invoice</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Invoice #{selectedOrder.order_id}</span>
                              <button
                                onClick={printInvoice}
                                className="ml-3 text-xs px-3 py-1 bg-lime-600 text-white rounded-md hover:bg-lime-700 flex items-center no-print"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Print
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Restaurant Information */}
                        <div className="p-4 border-b bg-gray-50">
                          <h4 className="font-bold text-lg text-gray-800 mb-2">FoodHub Restaurant</h4>
                          <p className="text-sm text-gray-600">123 Food Street, Foodville</p>
                          <p className="text-sm text-gray-600">Phone: +91 1234567890</p>
                          <p className="text-sm text-gray-600">Email: contact@foodhub.com</p>
                          <p className="text-sm text-gray-600">GST No: 22AAAAA0000A1Z5</p>
                        </div>
                        
                        {/* Invoice Details */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Order Information</h4>
                            <p className="text-sm"><span className="text-gray-600">Order ID:</span> {selectedOrder.order_id}</p>
                            <p className="text-sm"><span className="text-gray-600">Order Date:</span> {formatDate(selectedOrder.created_at)}</p>
                            <p className="text-sm"><span className="text-gray-600">Status:</span> 
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                            <p className="text-sm"><span className="text-gray-600">Name:</span> {selectedOrder.customer_name || 'Not provided'}</p>
                            <p className="text-sm"><span className="text-gray-600">Address:</span> {selectedOrder.delivery_address || 'Not provided'}</p>
                            <p className="text-sm"><span className="text-gray-600">Phone:</span> {selectedOrder.phone_number || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        {/* Pickup Information */}
                        <div className="p-4 border-b">
                          <h4 className="font-semibold text-gray-700 mb-2">Pickup Information</h4>
                          <p className="text-sm">
                            <span className="text-gray-600">Pickup Time:</span> 
                            <span className="ml-2 font-medium">{formatDate(selectedOrder.pickup_time)}</span>
                          </p>
                        </div>
                        
                        {/* Payment Information */}
                        <div className="p-4 border-b">
                          <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
                          <p className="text-sm">
                            <span className="text-gray-600">Payment Method:</span> 
                            <span className="ml-2 font-medium">
                              {selectedOrder.payment_method 
                                ? selectedOrder.payment_method.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.payment_method.replace('_', ' ').slice(1).toLowerCase()
                                : 'Not specified'}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Payment ID:</span> 
                            <span className="ml-2 font-medium">{selectedOrder.payment_id || 'N/A'}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Payment Status:</span> 
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                              selectedOrder.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                              selectedOrder.payment_status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedOrder.payment_status || 'Unknown'}
                            </span>
                          </p>
                        </div>
                        
                        {/* Order Items */}
                        <div className="p-4 border-b">
                          <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                  <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedOrder.order_items.map(item => (
                                  <tr key={item.id}>
                                    <td className="py-2 px-3 text-sm font-medium text-gray-900">{item.food_name}</td>
                                    <td className="py-2 px-3 text-sm text-gray-500 text-right">{item.quantity}</td>
                                    <td className="py-2 px-3 text-sm text-gray-500 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                                    <td className="py-2 px-3 text-sm text-gray-500 text-right">₹{parseFloat(item.subtotal).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="p-4 bg-gray-50">
                          <h4 className="font-semibold text-gray-700 mb-2">Order Summary</h4>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tax (GST):</span>
                              <span>₹{parseFloat(selectedOrder.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Delivery Fee:</span>
                              <span>₹{parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200">
                              <span>Total Amount:</span>
                              <span>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          {/* Terms and Conditions */}
                          <div className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
                            <p className="font-medium mb-1">Terms & Conditions:</p>
                            <p>1. All prices are inclusive of applicable taxes.</p>
                            <p>2. This is a computer-generated invoice and does not require a signature.</p>
                            <p>3. For any queries regarding this order, please contact our customer support.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory; 