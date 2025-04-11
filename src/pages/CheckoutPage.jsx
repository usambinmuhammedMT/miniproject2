import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentProcessor from '../components/PaymentProcessor';
import OrderReceipt from '../components/OrderReceipt';
import { API_URL } from '../App';
import { useModal } from '../contexts/ModalContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const userId = localStorage.getItem('userRole');
  const { showConfirmationModal } = useModal();
  
  // In a real app, this would come from cart state or API
  // For now, create a sample order
  const [order] = useState(() => {
    const sampleOrder = location.state?.order || {
      id: 'ORD' + Date.now(),
      items: [
        { id: 1, name: 'Margherita Pizza', price: 9.99, quantity: 1 },
        { id: 2, name: 'Garlic Bread', price: 3.99, quantity: 2 },
        { id: 3, name: 'Coca Cola', price: 1.99, quantity: 2 }
      ],
      subtotal: 21.95,
      tax: 1.97,
      deliveryFee: 2.99,
      totalAmount: 26.91,
      customerName: 'John Doe',
      deliveryAddress: '123 Main St, Anytown, USA',
      phoneNumber: '(555) 123-4567'
    };
    
    return sampleOrder;
  });

  const handlePaymentComplete = async (result) => {
    setPaymentResult(result);
    setIsProcessingOrder(true);
    
    try {
      // Get the cart ID first
      const cartResponse = await fetch(`${API_URL}/carts/?user_id=${userId}`);
      if (!cartResponse.ok) {
        throw new Error('Failed to retrieve cart information');
      }
      
      const cartsData = await cartResponse.json();
      const userCart = cartsData.results && cartsData.results.length > 0 ? cartsData.results[0] : null;
      
      if (!userCart || !userCart.id) {
        throw new Error('No active cart found');
      }
      
      // Use the checkout endpoint to create order and clear cart in one operation
      const checkoutResponse = await fetch(`${API_URL}/carts/${userCart.id}/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: result.paymentMethod,
          payment_id: result.transactionId,
          subtotal: order.subtotal,
          tax: order.tax,
          delivery_fee: order.deliveryFee,
          total_amount: order.totalAmount,
          pickup_time: result.pickupTime,
          customer_name: order.customerName,
          delivery_address: order.deliveryAddress,
          phone_number: order.phoneNumber,
          payment_status: result.status
        })
      });
      
      if (!checkoutResponse.ok) {
        throw new Error('Failed to complete checkout');
      }
      
      const checkoutData = await checkoutResponse.json();
      console.log('Checkout successful:', checkoutData);
      
      // Update order with actual order ID from backend
      if (checkoutData.order_id) {
        order.id = checkoutData.order_id;
      }
      
      // Store pickup time in the order object for the receipt
      order.pickupTime = result.pickupTime;
      
      // 3. Show the receipt
      setPaymentComplete(true);
      setIsProcessingOrder(false);
    } catch (error) {
      console.error('Error processing order:', error);
      setOrderError(error.message || 'Failed to process your order. Please try again.');
      setIsProcessingOrder(false);
      
      // Store pickup time in the order object for the receipt even if there's an error
      if (result.pickupTime) {
        order.pickupTime = result.pickupTime;
      }
      
      // Even if backend order creation fails, we still show receipt for demo purposes
      // In a real app, you might want to handle this differently
      setPaymentComplete(true);
    }
  };

  const handleCancel = () => {
    // Show confirmation before canceling
    showConfirmationModal(
      'Cancel Order',
      'Are you sure you want to cancel your order?',
      () => {
        navigate('/');
      }
    );
  };

  if (isProcessingOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-lime-600 mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Finalizing Your Order</h2>
          <p className="text-gray-600 text-center">
            Please wait while we process your order. This will just take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!paymentComplete ? (
        <>
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order Details Section */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Order Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                    <p className="mt-1">{order.customerName}</p>
                    <p>{order.deliveryAddress}</p>
                    <p>{order.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Items</h3>
                    <ul className="mt-1 divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between">
                          <div>
                            <span>{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Processor Section */}
            <div className="md:col-span-2">
              <PaymentProcessor 
                order={order} 
                onPaymentComplete={handlePaymentComplete} 
                onCancel={handleCancel}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {orderError && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    {orderError}
                  </p>
                  <p className="mt-2 text-xs">
                    Note: This is a demo, so we're showing the receipt anyway. In a real application, you might handle this error differently.
                  </p>
                </div>
              </div>
            </div>
          )}
          <OrderReceipt order={order} payment={paymentResult} />
        </>
      )}
    </div>
  );
};

export default CheckoutPage; 