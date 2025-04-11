import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userRole');
  const { showErrorAlert } = useModal();

  // Fetch cart data
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/carts/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const data = await response.json();
      const userCart = data.results && data.results.length > 0 ? data.results[0] : null;
      setCart(userCart);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  // Update item quantity
  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await fetch(`${API_URL}/carts/${cart.id}/update_item_quantity/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: quantity
        })
      });
      
      if (!response.ok) throw new Error('Failed to update quantity');
      
      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (err) {
      console.error('Error updating quantity:', err);
      showErrorAlert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      const response = await fetch(`${API_URL}/carts/${cart.id}/remove_item/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_id: cartItemId
        })
      });
      
      if (!response.ok) throw new Error('Failed to remove item');
      
      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (err) {
      console.error('Error removing item:', err);
      showErrorAlert('Error', 'Failed to remove item. Please try again.');
    }
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      showErrorAlert('Empty Cart', 'Your cart is empty. Add some items before checking out.');
      return;
    }
    
    // Create an order object to pass to the checkout page
    const order = {
      id: 'ORD' + Date.now(),
      items: cart.cart_items.map(item => ({
        id: item.id,
        name: item.food_item.name,
        price: item.food_item.price,
        quantity: item.quantity
      })),
      subtotal: cart.total_price,
      tax: (cart.total_price * 0.09).toFixed(2), // 9% tax for example
      deliveryFee: 2.99,
      totalAmount: (parseFloat(cart.total_price) + (cart.total_price * 0.09) + 2.99).toFixed(2),
      customerName: "John Doe", // In a real app, you'd get this from user profile
      deliveryAddress: "123 Main St, Anytown, USA", // In a real app, you'd get this from user profile
      phoneNumber: "(555) 123-4567" // In a real app, you'd get this from user profile
    };
    
    // Navigate to checkout page with order details
    navigate('/checkout', { state: { order } });
  };

  if (loading) {
    return <div className="text-center my-8">Loading cart...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center my-8">{error}</div>;
  }

  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return (
      <div className="text-center my-12">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Cart Items</h2>
        </div>
        
        <div className="divide-y">
          {cart.cart_items.map(item => (
            <div key={item.id} className="py-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-medium">{item.food_item.name}</h3>
                <p className="text-gray-600 text-sm">₹{item.food_item.price} each</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="bg-gray-200 px-3 py-1 rounded-l-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded-r-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                
                <span className="font-semibold w-20 text-right">₹{item.subtotal}</span>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t mt-6 pt-6">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>₹{cart.total_price}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-lime-600 text-white py-3 rounded-lg hover:bg-lime-700 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 