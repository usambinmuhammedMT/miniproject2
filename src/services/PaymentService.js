/**
 * PaymentService.js
 * Simulates payment processing with dummy payment gateway
 */

// Simulate different payment methods available
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  WALLET: 'WALLET',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
};

// Simulate payment statuses
export const PAYMENT_STATUS = {
  INITIALIZED: 'INITIALIZED',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

/**
 * Initializes a payment transaction
 * @param {Object} paymentDetails - Order and payment details
 * @returns {Promise<Object>} - Payment transaction details
 */
export const initializePayment = (paymentDetails) => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate a random transaction ID
      const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      resolve({
        transactionId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency || 'INR',
        paymentMethod: paymentDetails.paymentMethod,
        orderId: paymentDetails.orderId,
        status: PAYMENT_STATUS.INITIALIZED,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};

/**
 * Process a payment transaction
 * @param {Object} transaction - Transaction details from initializePayment
 * @param {Object} paymentData - Payment method specific data
 * @returns {Promise<Object>} - Updated transaction details
 */
export const processPayment = (transaction, paymentData) => {
  return new Promise((resolve, reject) => {
    // Validate the transaction object
    if (!transaction || !transaction.transactionId) {
      reject(new Error('Invalid transaction details'));
      return;
    }
    
    // Simulate processing delay
    setTimeout(() => {
      // Randomly determine if the payment succeeds or fails (80% success rate)
      const isSuccessful = Math.random() < 0.8;
      
      if (isSuccessful) {
        resolve({
          ...transaction,
          status: PAYMENT_STATUS.SUCCESS,
          completedTimestamp: new Date().toISOString(),
          paymentData: {
            // Include masked payment data for receipts
            method: transaction.paymentMethod,
            ...(transaction.paymentMethod === PAYMENT_METHODS.CREDIT_CARD && {
              last4: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
              cardType: getCardType(paymentData.cardNumber)
            })
          }
        });
      } else {
        // Generate a random error message
        const errorMessages = [
          'Your card was declined. Please try a different payment method.',
          'There was an issue processing your payment. Please try again.',
          'Your card has insufficient funds.',
          'The payment service is temporarily unavailable.'
        ];
        
        resolve({
          ...transaction,
          status: PAYMENT_STATUS.FAILED,
          completedTimestamp: new Date().toISOString(),
          errorMessage: errorMessages[Math.floor(Math.random() * errorMessages.length)]
        });
      }
    }, 2000);
  });
};

/**
 * Validates payment method specific data
 * @param {string} paymentMethod - Payment method
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} - Validation result with any errors
 */
export const validatePaymentData = (paymentMethod, paymentData) => {
  const errors = {};
  
  if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD || paymentMethod === PAYMENT_METHODS.DEBIT_CARD) {
    // Validate card number (simple check for demo)
    if (!paymentData.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{4}(\s\d{4}){3}$|^\d{16}$/.test(paymentData.cardNumber)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Validate cardholder name
    if (!paymentData.cardholderName) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    // Validate expiry date (simple MM/YY format check)
    if (!paymentData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      // Check if the card is expired
      const [month, year] = paymentData.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
      const now = new Date();
      
      if (expiryDate < now) {
        errors.expiryDate = 'Your card has expired';
      }
    }
    
    // Validate CVV (simple check for demo)
    if (!paymentData.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
      errors.cvv = 'Please enter a valid CVV';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Test card details for development
export const TEST_CARD_DETAILS = {
  cardNumber: '4111 1111 1111 1111',
  cardholderName: 'Test User',
  expiryDate: '12/25',
  cvv: '123'
};

/**
 * Cancel a payment transaction
 * @param {Object} transaction - Transaction to cancel
 * @returns {Promise<Object>} - Updated transaction details
 */
export const cancelPayment = (transaction) => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      resolve({
        ...transaction,
        status: PAYMENT_STATUS.CANCELLED,
        cancelledTimestamp: new Date().toISOString()
      });
    }, 1000);
  });
};

// Helper function to determine card type based on the card number
const getCardType = (cardNumber) => {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Very simple card type detection for demo purposes
  if (/^4/.test(cleanNumber)) {
    return 'Visa';
  } else if (/^5[1-5]/.test(cleanNumber)) {
    return 'MasterCard';
  } else if (/^3[47]/.test(cleanNumber)) {
    return 'American Express';
  } else if (/^6(?:011|5)/.test(cleanNumber)) {
    return 'Discover';
  } else {
    return 'Unknown';
  }
}; 