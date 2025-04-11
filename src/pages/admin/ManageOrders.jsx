import React, { useState, useEffect } from 'react';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { showErrorAlert, showSuccessAlert } = useModal();

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.results || data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // View order details
  const viewOrderDetails = async (orderId) => {
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
      return;
    }
    
    // Close invoice view if open
    setSelectedInvoice(null);
    
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

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/update_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      // Update local state
      const updatedOrder = await response.json();
      setOrders(orders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));
      
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
      
      showSuccessAlert('Status Updated', `Order status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Error updating status:', err);
      showErrorAlert('Error', 'Failed to update order status. Please try again.');
    }
  };

  // Get invoice for an order
  const getInvoice = async (order) => {
    // Close order details if open
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(null);
    }
    
    // Toggle invoice view if already viewing this invoice
    if (selectedInvoice && selectedInvoice.orderId === order.id) {
      setSelectedInvoice(null);
      return;
    }
    
    // Track loading state for this specific order
    setLoadingInvoices(prev => ({ ...prev, [order.id]: true }));
    
    try {
      // Use the order_id (UUID) instead of the numeric id
      const response = await fetch(`${API_URL}/invoices/get_by_order/?order_id=${order.order_id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invoice not found. The order may not have an associated invoice yet.');
        }
        throw new Error('Failed to fetch invoice');
      }
      
      const invoiceData = await response.json();
      
      // Now fetch order details to get complete information
      const orderResponse = await fetch(`${API_URL}/orders/${order.id}/`);
      if (!orderResponse.ok) throw new Error('Failed to fetch order details for invoice');
      
      const orderData = await orderResponse.json();
      
      // Set selected invoice with combined data
      setSelectedInvoice({
        ...invoiceData,
        order: orderData,
        orderId: order.id
      });
      
    } catch (err) {
      console.error('Error fetching invoice:', err);
      showErrorAlert('Error', err.message || 'Failed to fetch invoice. Please try again.');
    } finally {
      setLoadingInvoices(prev => ({ ...prev, [order.id]: false }));
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
    return <div className="text-center my-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center my-8">{error}</div>;
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

      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <button
          onClick={fetchOrders}
          className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition"
        >
          Refresh
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center my-12 text-gray-600">No orders found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden no-print">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Order ID</th>
                <th className="py-3 px-4 text-left font-semibold">User</th>
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
                    <td className="py-3 px-4">{order.user_id}</td>
                    <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="text-lime-600 hover:text-lime-800"
                        >
                          {selectedOrder && selectedOrder.id === order.id ? 'Hide Details' : 'View Details'}
                        </button>
                        
                        <button
                          onClick={() => getInvoice(order)}
                          disabled={loadingInvoices[order.id]}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          {loadingInvoices[order.id] ? 'Loading...' : selectedInvoice && selectedInvoice.orderId === order.id ? 'Hide Invoice' : 'View Invoice'}
                        </button>
                        
                        <select 
                          className="border rounded py-1 px-2"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  
                  {selectedOrder && selectedOrder.id === order.id && (
                    <tr>
                      <td colSpan="6" className="bg-gray-50 p-4">
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Order Items</h3>
                          <div className="divide-y border rounded-lg overflow-hidden">
                            {selectedOrder.order_items.map(item => (
                              <div key={item.id} className="flex justify-between items-center p-3 bg-white">
                                <div>
                                  <span className="font-medium">{item.food_name}</span>
                                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                </div>
                                <div className="font-semibold">₹{parseFloat(item.subtotal).toFixed(2)}</div>
                              </div>
                            ))}
                            
                            <div className="p-3 bg-white flex justify-between font-bold">
                              <span>Total:</span>
                              <span>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Customer Information */}
                        {selectedOrder.customer_name && (
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2">Customer Information</h3>
                            <div className="border rounded-lg overflow-hidden p-3 bg-white">
                              <p className="mb-1"><span className="text-gray-600">Name:</span> {selectedOrder.customer_name}</p>
                              {selectedOrder.delivery_address && <p className="mb-1"><span className="text-gray-600">Address:</span> {selectedOrder.delivery_address}</p>}
                              {selectedOrder.phone_number && <p><span className="text-gray-600">Phone:</span> {selectedOrder.phone_number}</p>}
                            </div>
                          </div>
                        )}
                        
                        {/* Pickup Information */}
                        {selectedOrder.pickup_time && (
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2">Pickup Information</h3>
                            <div className="border rounded-lg overflow-hidden p-3 bg-white">
                              <p><span className="text-gray-600">Pickup Time:</span> {formatDate(selectedOrder.pickup_time)}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => getInvoice(order)}
                            disabled={loadingInvoices[order.id]}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loadingInvoices[order.id] ? 'Loading Invoice...' : 'View Invoice'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {selectedInvoice && selectedInvoice.orderId === order.id && (
                    <tr>
                      <td colSpan="6" className="bg-gray-50 p-6">
                        <div className="border rounded-lg overflow-hidden bg-white shadow-sm invoice-container">
                          {/* Invoice Header */}
                          <div className="bg-lime-50 p-4 border-b">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xl font-bold text-gray-800">Order Invoice</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Invoice #{selectedInvoice.invoice_number}</span>
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
                              <p className="text-sm"><span className="text-gray-600">Order ID:</span> {selectedInvoice.order.order_id}</p>
                              <p className="text-sm"><span className="text-gray-600">Order Date:</span> {formatDate(selectedInvoice.order.created_at)}</p>
                              <p className="text-sm"><span className="text-gray-600">Invoice Date:</span> {formatDate(selectedInvoice.invoice_date)}</p>
                              <p className="text-sm"><span className="text-gray-600">Status:</span> 
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedInvoice.order.status)}`}>
                                  {selectedInvoice.order.status.charAt(0).toUpperCase() + selectedInvoice.order.status.slice(1)}
                                </span>
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                              <p className="text-sm"><span className="text-gray-600">User ID:</span> {selectedInvoice.order.user_id}</p>
                              <p className="text-sm"><span className="text-gray-600">Name:</span> {selectedInvoice.order.customer_name || 'Not provided'}</p>
                              <p className="text-sm"><span className="text-gray-600">Address:</span> {selectedInvoice.order.delivery_address || 'Not provided'}</p>
                              <p className="text-sm"><span className="text-gray-600">Phone:</span> {selectedInvoice.order.phone_number || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          {/* Pickup Information */}
                          <div className="p-4 border-b">
                            <h4 className="font-semibold text-gray-700 mb-2">Pickup Information</h4>
                            <p className="text-sm">
                              <span className="text-gray-600">Pickup Time:</span> 
                              <span className="ml-2 font-medium">{formatDate(selectedInvoice.order.pickup_time)}</span>
                            </p>
                          </div>
                          
                          {/* Payment Information */}
                          <div className="p-4 border-b">
                            <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
                            <p className="text-sm">
                              <span className="text-gray-600">Payment Method:</span> 
                              <span className="ml-2 font-medium">
                                {selectedInvoice.order.payment_method 
                                  ? selectedInvoice.order.payment_method.replace('_', ' ').charAt(0).toUpperCase() + selectedInvoice.order.payment_method.replace('_', ' ').slice(1).toLowerCase()
                                  : 'Not specified'}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Payment ID:</span> 
                              <span className="ml-2 font-medium">{selectedInvoice.order.payment_id || 'N/A'}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Payment Status:</span> 
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                selectedInvoice.order.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                                selectedInvoice.order.payment_status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedInvoice.order.payment_status || 'Unknown'}
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
                                  {selectedInvoice.order.order_items.map(item => (
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
                                <span>₹{parseFloat(selectedInvoice.order.subtotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (GST):</span>
                                <span>₹{parseFloat(selectedInvoice.order.tax).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fee:</span>
                                <span>₹{parseFloat(selectedInvoice.order.delivery_fee).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200">
                                <span>Total Amount:</span>
                                <span>₹{parseFloat(selectedInvoice.order.total_amount).toFixed(2)}</span>
                              </div>
                            </div>
                            
                            {/* Admin Actions */}
                            <div className="mt-6 flex justify-end space-x-3 no-print">
                              <button
                                onClick={() => updateOrderStatus(selectedInvoice.order.id, 'completed')}
                                className={`px-3 py-2 text-sm rounded-md ${
                                  selectedInvoice.order.status === 'completed' 
                                    ? 'bg-gray-200 text-gray-800 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                disabled={selectedInvoice.order.status === 'completed'}
                              >
                                Mark as Completed
                              </button>
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
      )}
    </div>
  );
};

export default ManageOrders; 