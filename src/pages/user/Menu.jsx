import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';


const Menu = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const userId = localStorage.getItem('userRole');
  const [featuredItems, setFeaturedItems] = useState([]);
  const { showErrorAlert } = useModal();

  // Fetch categories
  useEffect(() => {
    fetch(`${API_URL}/categories/`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
      })
      .then(data => {
        setCategories(data.results || data);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      });
  }, []);

  // Fetch food items
  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'all' 
      ? `${API_URL}/food-items/` 
      : `${API_URL}/food-items/?category=${selectedCategory}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch food items');
        return response.json();
      })
      .then(data => {
        const items = data.results || data;
        setFoodItems(items);
        
        // Set featured items (selecting 3 random items that are available)
        if (selectedCategory === 'all' && items.length > 0) {
          const availableItems = items.filter(item => item.is_available);
          const randomItems = availableItems
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(3, availableItems.length));
          setFeaturedItems(randomItems);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching food items:', err);
        setError('Failed to load menu items. Please try again later.');
        setLoading(false);
      });
  }, [selectedCategory]);

  // Add item to cart
  const addToCart = async (foodItem) => {
    try {
      // First check if user has a cart, if not create one
      let cart;
      let cartResponse = await fetch(`${API_URL}/carts/?user_id=${userId}`);
      let cartData = await cartResponse.json();
      
      if (!cartData.results || cartData.results.length === 0) {
        // Create a new cart for the user
        const createCartResponse = await fetch(`${API_URL}/carts/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });
        cart = await createCartResponse.json();
      } else {
        cart = cartData.results[0];
      }
      
      // Add item to cart
      const response = await fetch(`${API_URL}/carts/${cart.id}/add_item/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_item_id: foodItem.id,
          quantity: 1
        })
      });
      
      if (!response.ok) throw new Error('Failed to add item to cart');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-lime-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-up';
      notification.innerHTML = `
        <div class="flex items-center">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>${foodItem.name} added to cart!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      showErrorAlert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  // Filter food items based on search term
  const filteredFoodItems = foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Food item card - extract as a component for reuse
  const FoodItemCard = ({ item, featured = false }) => (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 ${
        featured ? 'transform hover:-translate-y-1 transition-transform duration-300' : ''
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/80 text-lime-700">
            {item.category_name}
          </span>
        </div>
        {featured && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-yellow-800">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
          <span className="font-bold text-lime-600">${item.price}</span>
        </div>
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        )}
        <div className="mt-4">
          <button
            onClick={() => addToCart(item)}
            disabled={!item.is_available}
            className={`w-full py-2 px-4 rounded-lg text-center font-medium transition-colors duration-200 ${
              item.is_available 
                ? 'bg-lime-600 hover:bg-lime-700 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.is_available ? (
              <span className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </span>
            ) : 'Currently Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );

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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Our Menu</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Featured Section - Only show on 'all' category when not searching */}
      {selectedCategory === 'all' && !searchTerm && featuredItems.length > 0 && !loading && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Featured Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map(item => (
              <FoodItemCard key={`featured-${item.id}`} item={item} featured={true} />
            ))}
          </div>
        </div>
      )}
      
      {/* Category Filters */}
      <div className="mb-10 sticky top-16 z-10 bg-gray-50 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Categories</h2>
          {categories.length > 5 && (
            <button className="text-sm text-lime-600 hover:text-lime-700">View All</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              selectedCategory === 'all'
                ? 'bg-lime-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-lime-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Food Items */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
        </div>
      ) : (
        <div>
          {selectedCategory !== 'all' && !searchTerm && (
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
            </h2>
          )}
          
          {searchTerm && (
            <h2 className="text-xl font-medium text-gray-700 mb-6">
              Search results for "{searchTerm}"
            </h2>
          )}
          
          {filteredFoodItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFoodItems.map(item => (
                <FoodItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-1">No items found</h3>
              <p className="text-gray-500 max-w-md">
                {searchTerm 
                  ? `We couldn't find any food items matching "${searchTerm}". Try a different search term or category.` 
                  : 'No food items available in this category. Please try another category.'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="mt-4 text-lime-600 font-medium hover:text-lime-700"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu; 