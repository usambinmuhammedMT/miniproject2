import React, { useState, useEffect } from 'react';
import { API_URL } from '../../App';
import { useModal } from '../../contexts/ModalContext';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccessAlert, showErrorAlert, showConfirmationModal } = useModal();

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.results || data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes for new category
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      showErrorAlert('Validation Error', 'Category name is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const addedCategory = await response.json();
      setCategories([...categories, addedCategory]);
      setNewCategory({ name: '', description: '' });
      setIsAdding(false);
      
      showSuccessAlert('Success', 'Category added successfully!');
    } catch (err) {
      console.error('Error adding category:', err);
      showErrorAlert('Error', err.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    showConfirmationModal(
      'Confirm Deletion', 
      'Are you sure you want to delete this category?',
      async () => {
        try {
          const response = await fetch(`${API_URL}/categories/${id}/`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            // Check if there's a structured error response
            if (response.headers.get('content-type')?.includes('application/json')) {
              const errorData = await response.json();
              throw new Error(errorData.detail || 'Failed to delete category');
            }
            throw new Error('Failed to delete category');
          }

          setCategories(categories.filter(category => category.id !== id));
          showSuccessAlert('Success', 'Category deleted successfully!');
        } catch (err) {
          console.error('Error deleting category:', err);
          showErrorAlert('Error', err.message);
        }
      }
    );
  };

  // Toggle add category form
  const toggleAddForm = () => {
    setIsAdding(!isAdding);
    if (!isAdding) {
      setNewCategory({ name: '', description: '' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
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
        <h1 className="text-2xl font-bold">Food Categories</h1>
        <button
          onClick={toggleAddForm}
          className={`px-4 py-2 rounded-md ${
            isAdding ? 'bg-gray-500 text-white' : 'bg-lime-600 text-white'
          } hover:bg-lime-700`}
        >
          {isAdding ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="bg-lime-600 text-white px-4 py-2 rounded-md hover:bg-lime-700"
            >
              Add Category
            </button>
          </form>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-8 bg-white shadow-md rounded-lg">
          <p className="text-gray-600">No categories found. Add your first category!</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {category.description || <span className="italic text-gray-400">No description</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
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

export default CategoryPage;
