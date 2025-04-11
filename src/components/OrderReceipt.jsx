import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderReceipt = ({ order, payment }) => {
  const navigate = useNavigate();
  
  if (!order || !payment) {
    return <p>No order or payment information available.</p>;
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatPickupTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    
    const date = new Date(dateTimeString);
    const options = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString(undefined, options);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      {/* Header with success banner */}
      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-green-800">Order Confirmed!</h2>
            <p className="text-sm text-green-700">
              Your order has been placed successfully and will be delivered soon.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Receipt</h1>
          <p className="text-gray-600">Thank you for your order!</p>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{formatDate(payment.completedTimestamp || new Date())}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium capitalize">
            {payment.paymentMethod.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Order Items</h2>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span>₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tax:</span>
          <span>₹{order.tax}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Delivery Fee:</span>
          <span>₹{order.deliveryFee}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
          <span>Total:</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Delivery Information</h2>
        <p className="mb-1 font-medium">{order.customerName}</p>
        <p className="mb-1 text-gray-600">{order.deliveryAddress}</p>
        <p className="text-gray-600">{order.phoneNumber}</p>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Payment Information</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Transaction ID:</span>
          <span className="font-medium">{payment.transactionId}</span>
        </div>
        {payment.paymentData?.last4 && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Card:</span>
            <span className="font-medium">
              {payment.paymentData.cardType} ending in {payment.paymentData.last4}
            </span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Pickup Information</h2>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Pickup Time:</span>
          <span className="font-medium">{formatPickupTime(order.pickupTime)}</span>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg mt-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Please arrive at the restaurant at your chosen pickup time. Your order will be ready.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              A confirmation email has been sent to your email address. You can also view your order in the Order History section.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/menu')}
          className="w-1/2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Back to Menu
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="w-1/2 px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          View Orders
        </button>
      </div>
    </div>
  );
};

export default OrderReceipt; 