import API from './api';  // Reuse the API instance created earlier

// Utility to get the token
const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token");

// Add a new product
export const addProduct = async (productData) => {
  try {
    const payload = {
      products: productData.map(product => ({
        category: product.category || 'defaultcategory', // Ensure a valid category
        modifications: {
          fivePrime: product.modifications?.fivePrime || '', // Properly serialize
          threePrime: product.modifications?.threePrime || ''
        },
        saflaştırma: product.saflaştırma || '', // Ensure naming matches backend
        uzunluk: product.uzunluk || 0,
        sekans: product.sekans || '',
        scale: product.scale || 'nmol',
        totalPrice: product.totalPrice || 0,
        oligoAdi: product.oligoAdi || 'Unnamed Product',
        userId: product.userId || '', // Validate this field
        quantity: product.quantity || 1
      }))
    };

    const token = getAuthToken();  // Get token from storage
    if (!token) throw new Error('Authentication token is missing');

    const response = await API.post('/products', JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error.response?.data || error.message);
    throw error; // Let the calling component handle it
  }
};

// Get products for the authenticated user
// Get products (all or for a specific user)
export const getProducts = async (userRole, userId, isSpecificUser = false) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Token is missing');

    const response = await API.get('/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId,
        isSpecificUser,
      },
    });

    return response.data; // List of products
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;  // Return the product details for the specified ID
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.response?.data || error.message);
    throw error;  // Rethrow error for handling in the calling component
  }
};

// Update an existing product by ID
export const updateProduct = async (id, updatedData) => {
    try {
      console.log("Updating product with ID:", id); // Debugging log
      console.log("Updated Data:", updatedData); // Debugging log

      const response = await API.put(`/products/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  };


// Delete a product by ID
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data;  // Return the response from the delete request
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error.response?.data || error.message);
    throw error;  // Rethrow error for handling in the calling component
  }
};
