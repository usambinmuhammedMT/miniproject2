import React, { useState } from 'react';
import { 
  initializePayment, 
  processPayment, 
  validatePaymentData,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TEST_CARD_DETAILS
} from '../services/PaymentService';

const PaymentProcessor = ({ order, onPaymentComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CREDIT_CARD);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [transaction, setTransaction] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTestData, setShowTestData] = useState(false);
  const [pickupTime, setPickupTime] = useState(() => {
    // Set default pickup time to 30 minutes from now
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  });

  // Initialize payment when component mounts
  React.useEffect(() => {
    const init = async () => {
      try {
        const paymentDetails = {
          amount: order.totalAmount,
          currency: 'USD',
          orderId: order.id,
          paymentMethod
        };
        
        const transaction = await initializePayment(paymentDetails);
        setTransaction(transaction);
        setPaymentStatus(PAYMENT_STATUS.INITIALIZED);
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        setErrors({ general: 'Failed to initialize payment. Please try again.' });
      }
    };
    
    if (order) {
      init();
    }
  }, [order]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Use test data for convenience
  const applyTestData = () => {
    setCardData(TEST_CARD_DETAILS);
    setShowTestData(false);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({});
  };

  // Handle pickup time change
  const handlePickupTimeChange = (e) => {
    setPickupTime(e.target.value);
    
    // Clear error if it exists
    if (errors.pickupTime) {
      setErrors({
        ...errors,
        pickupTime: null
      });
    }
  };
  
  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };

  // Process the payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    // Validate payment data
    const validation = validatePaymentData(paymentMethod, cardData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Validate pickup time
    if (!pickupTime) {
      setErrors({
        ...errors,
        pickupTime: 'Please select a pickup time'
      });
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus(PAYMENT_STATUS.PROCESSING);
    
    try {
      // Process the payment
      const result = await processPayment(transaction, cardData);
      
      // Add pickup time to the transaction data
      result.pickupTime = pickupTime;
      
      setTransaction(result);
      setPaymentStatus(result.status);
      
      // Notify parent component of completion
      if (result.status === PAYMENT_STATUS.SUCCESS) {
        onPaymentComplete(result);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setErrors({ general: 'Payment processing failed. Please try again.' });
      setPaymentStatus(PAYMENT_STATUS.FAILED);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel();
  };

  // Generate appropriate UI based on payment status
  const renderPaymentUI = () => {
    switch (paymentStatus) {
      case PAYMENT_STATUS.INITIALIZED:
        return renderPaymentForm();
      case PAYMENT_STATUS.PROCESSING:
        return renderProcessingUI();
      case PAYMENT_STATUS.SUCCESS:
        return renderSuccessUI();
      case PAYMENT_STATUS.FAILED:
        return renderFailureUI();
      default:
        return <p>Initializing payment...</p>;
    }
  };

  // Render payment form based on selected payment method
  const renderPaymentForm = () => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
          {!showTestData && (
            <button 
              type="button" 
              onClick={() => setShowTestData(true)}
              className="text-sm text-lime-600 hover:text-lime-700"
            >
              Need test data?
            </button>
          )}
          
          {showTestData && (
            <button 
              type="button" 
              onClick={applyTestData}
              className="text-sm text-lime-600 hover:text-lime-700 font-semibold"
            >
              Apply test data
            </button>
          )}
        </div>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CREDIT_CARD)}
              className={`px-4 py-3 border ${
                paymentMethod === PAYMENT_METHODS.CREDIT_CARD
                  ? 'border-lime-600 bg-lime-50 text-lime-700'
                  : 'border-gray-300 text-gray-700'
              } rounded-lg flex items-center justify-center focus:outline-none`}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Credit Card
            </button>
            <button
              type="button"
              onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CASH_ON_DELIVERY)}
              className={`px-4 py-3 border ${
                paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY
                  ? 'border-lime-600 bg-lime-50 text-lime-700'
                  : 'border-gray-300 text-gray-700'
              } rounded-lg flex items-center justify-center focus:outline-none`}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cash on Delivery
            </button>
          </div>
        </div>
        
        {/* Pickup Time Selection */}
        <div className="mb-6">
          <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-2">
            Select Pickup Time
          </label>
          <input
            type="datetime-local"
            id="pickupTime"
            name="pickupTime"
            value={pickupTime}
            onChange={handlePickupTimeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
            min={getMinDateTime()}
          />
          {errors.pickupTime && (
            <p className="mt-1 text-sm text-red-600">{errors.pickupTime}</p>
          )}
        </div>
        
        {/* Payment Form */}
        <form onSubmit={handleSubmitPayment}>
          {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500`}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  name="cardholderName"
                  placeholder="John Doe"
                  value={cardData.cardholderName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500`}
                />
                {errors.cardholderName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500`}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    Pay with cash when your order is delivered. Please ensure you have the exact amount ready.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">₹{order.subtotal || order.totalAmount}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Delivery</p>
                <p className="font-medium">₹{order.deliveryFee || '0.00'}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Tax</p>
                <p className="font-medium">₹{order.tax || '0.00'}</p>
              </div>
              <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t border-gray-200">
                <p>Total</p>
                <p>₹{order.totalAmount}</p>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              {errors.general}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ₹${order.totalAmount}`
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render payment processing UI
  const renderProcessingUI = () => {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-lime-600 mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Payment</h2>
        <p className="text-gray-600 text-center mb-6">
          Please wait while we process your payment. This may take a few moments.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-lime-600 h-2.5 rounded-full w-1/2 animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Transaction ID: {transaction.transactionId}
        </p>
      </div>
    );
  };

  // Render success UI
  const renderSuccessUI = () => {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 text-center mb-6">
          Your payment has been processed successfully. Your order is now being prepared.
        </p>
        <div className="w-full border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">₹{transaction.amount}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium">{transaction.transactionId}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {new Date(transaction.completedTimestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium capitalize">
              {transaction.paymentMethod.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPaymentComplete(transaction)}
          className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 w-full"
        >
          Continue
        </button>
      </div>
    );
  };

  // Render failure UI
  const renderFailureUI = () => {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
        <p className="text-gray-600 text-center mb-6">
          {transaction.errorMessage || 'There was an issue processing your payment. Please try again.'}
        </p>
        <div className="w-full flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-500 w-1/2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentStatus(PAYMENT_STATUS.INITIALIZED);
              setErrors({});
            }}
            className="px-6 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 w-1/2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  if (!order) {
    return <p>No order information provided.</p>;
  }

  return (
    <div className="max-w-md mx-auto">
      {renderPaymentUI()}
    </div>
  );
};

export default PaymentProcessor; 