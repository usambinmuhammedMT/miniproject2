import React, { useState, useEffect } from 'react';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newFoodItem, setNewFoodItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_available: true
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showSuccessAlert, showErrorAlert, showConfirmationModal } = useModal();

  // Fetch food items
  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/food-items/`);
      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }
      const data = await response.json();
      setFoodItems(data.results || data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.results || data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // We don't set loading or error state here as it's secondary data
    }
  };

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  // Handle form input changes for new food item
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isEditing) {
      setEditingItem(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setNewFoodItem(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Add new food item
  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    
    if (!newFoodItem.name.trim() || !newFoodItem.price || !newFoodItem.category) {
      showErrorAlert('Validation Error', 'Name, price, and category are required');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/food-items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFoodItem),
      });

      if (!response.ok) {
        throw new Error('Failed to create food item');
      }

      // Refresh the food items list
      await fetchFoodItems();
      
      // Reset form
      setNewFoodItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        is_available: true
      });
      setIsAdding(false);
      
      showSuccessAlert('Success', 'Food item added successfully!');
    } catch (err) {
      console.error('Error adding food item:', err);
      showErrorAlert('Error', err.message);
    }
  };

  // Handle update food item
  const handleUpdateFoodItem = async (e) => {
    e.preventDefault();
    
    if (!editingItem.name.trim() || !editingItem.price || !editingItem.category) {
      showErrorAlert('Validation Error', 'Name, price, and category are required');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/food-items/${editingItem.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) {
        throw new Error('Failed to update food item');
      }

      // Refresh the food items list
      await fetchFoodItems();
      
      // Reset editing state
      setEditingItem(null);
      setIsEditing(false);
      
      showSuccessAlert('Success', 'Food item updated successfully!');
    } catch (err) {
      console.error('Error updating food item:', err);
      showErrorAlert('Error', err.message);
    }
  };

  // Start editing a food item
  const startEditingItem = (item) => {
    setEditingItem({...item});
    setIsEditing(true);
    setIsAdding(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setIsEditing(false);
  };

  // Delete food item
  const handleDeleteFoodItem = async (id) => {
    showConfirmationModal(
      'Confirm Deletion',
      'Are you sure you want to delete this food item?',
      async () => {
        try {
          const response = await fetch(`${API_URL}/food-items/${id}/`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete food item');
          }

          setFoodItems(foodItems.filter(item => item.id !== id));
          showSuccessAlert('Success', 'Food item deleted successfully!');
        } catch (err) {
          console.error('Error deleting food item:', err);
          showErrorAlert('Error', err.message);
        }
      }
    );
  };

  // Toggle availability
  const toggleAvailability = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/food-items/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // Update local state to reflect change
      setFoodItems(
        foodItems.map(item => 
          item.id === id 
            ? { ...item, is_available: !currentStatus } 
            : item
        )
      );
    } catch (err) {
      console.error('Error updating availability:', err);
      showErrorAlert('Error', err.message);
    }
  };

  // Toggle add food item form
  const toggleAddForm = () => {
    setIsAdding(!isAdding);
    if (isEditing) {
      setIsEditing(false);
      setEditingItem(null);
    }
    if (!isAdding) {
      setNewFoodItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        is_available: true
      });
    }
  };

  // Helper to get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  if (loading) {
    return <div className="text-center py-8">Loading food items...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Food Items</h1>
        {!isEditing && (
          <button
            onClick={toggleAddForm}
            className={`px-4 py-2 rounded-md ${
              isAdding ? 'bg-gray-500 text-white' : 'bg-lime-600 text-white'
            } hover:bg-lime-700`}
          >
            {isAdding ? 'Cancel' : 'Add New Food Item'}
          </button>
        )}
      </div>

      {/* Add Food Item Form */}
      {isAdding && !isEditing && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Food Item</h2>
          <form onSubmit={handleAddFoodItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newFoodItem.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={newFoodItem.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={newFoodItem.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={newFoodItem.image}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
                {newFoodItem.image && (
                  <div className="mt-2">
                    <img 
                      src={newFoodItem.image} 
                      alt="Preview" 
                      className="h-24 w-24 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={newFoodItem.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={newFoodItem.is_available}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-gray-700">Available for ordering</label>
              </div>
            </div>
            <button
              type="submit"
              className="bg-lime-600 text-white px-4 py-2 rounded-md hover:bg-lime-700"
            >
              Add Food Item
            </button>
          </form>
        </div>
      )}

      {/* Edit Food Item Form */}
      {isEditing && editingItem && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Food Item</h2>
          <form onSubmit={handleUpdateFoodItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingItem.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={editingItem.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={editingItem.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={editingItem.image || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
                {editingItem.image && (
                  <div className="mt-2">
                    <img 
                      src={editingItem.image} 
                      alt="Preview" 
                      className="h-24 w-24 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editingItem.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={editingItem.is_available}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-gray-700">Available for ordering</label>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Update Food Item
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Food Items List */}
      {foodItems.length === 0 ? (
        <div className="text-center py-8 bg-white shadow-md rounded-lg">
          <p className="text-gray-600">No food items found. Add your first food item!</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {foodItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.description ? (
                        item.description.length > 50 
                          ? `${item.description.substring(0, 50)}...` 
                          : item.description
                      ) : (
                        <span className="italic text-gray-400">No description</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.category_name || getCategoryName(item.category)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => startEditingItem(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFoodItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FoodItemsPage;
