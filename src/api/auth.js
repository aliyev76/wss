import API from './api'; // Import the API instance

let isRefreshing = false; // To avoid multiple refresh calls
let refreshPromise = null; // Promise to share refresh result across calls

// Helper to generate a unique key for user-specific data
const getAuthKey = (sessionId) => `auth_${sessionId}`;

// Function to refresh the authentication token
export const refreshAuthToken = async () => {
  if (isRefreshing) return refreshPromise; // Return the existing promise if already refreshing

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) throw new Error('Session ID is missing');

      const authKey = getAuthKey(sessionId);
      const userData = JSON.parse(sessionStorage.getItem(authKey));

      if (!userData || !userData.refreshToken) {
        console.error('Refresh token is missing for session:', sessionId);
        sessionStorage.clear();
        window.location.href = '/login'; // Redirect to login
        throw new Error('No refresh token found');
      }

      // Call the refresh token API
      const response = await API.post('/auth/refresh-token', {
        refreshToken: userData.refreshToken,
        sessionId,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Update sessionStorage with new tokens
      sessionStorage.setItem(
        authKey,
        JSON.stringify({
          ...userData,
          token: newToken,
          refreshToken: newRefreshToken || userData.refreshToken, // Update refresh token if provided
        })
      );

      console.log('Token refreshed successfully for session:', sessionId);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error.message);

      sessionStorage.clear(); // Clear invalid session data
      window.location.href = '/login'; // Redirect to login
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
// Fetch user profile based on the stored auth token
export const getUserProfile = async (navigate) => {
  try {
    const sessionId = sessionStorage.getItem('sessionId');
    const authKey = getAuthKey(sessionId);
    const userData = JSON.parse(sessionStorage.getItem(authKey));

    if (!userData || !userData.token) {
      console.error(`Authentication token is missing for session: ${sessionId}`);
      throw new Error('Authentication token is missing');
    }

    // Fetch user profile
    const response = await API.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    });

    return response.data.user;
  } catch (error) {
    console.error('Error fetching profile:', error.message);

    if (error.response?.data?.error === 'Unauthorized: Token expired') {
      try {
        await refreshAuthToken(); // Attempt to refresh the token
        return getUserProfile(navigate); // Retry fetching the profile
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        navigate('/login'); // Redirect to login
      }
    }

    throw error;
  }
};
// User Registration
export const register = async (data) => {
  try {
    const response = await API.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
    throw error;
  }
};

// Login Function
export const login = async (data, navigate) => {
  try {
    const response = await API.post('/auth/login', data);
    const { token, refreshToken, user, sessionId } = response.data;

    // Store sessionId and user-specific data in sessionStorage
    const authKey = getAuthKey(sessionId);
    sessionStorage.setItem(authKey, JSON.stringify({ token, refreshToken, profile: user }));
    sessionStorage.setItem('sessionId', sessionId);

    navigate(`/user/${user.username}/dashboard`); // Redirect to user's dashboard
    return { token, user };
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      navigate('/login'); // Redirect to login if unauthorized
    }

    throw error;
  }
};

// Forgot Password Request
export const forgotPassword = async (email) => {
  try {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot Password Error:', error.response?.data || error.message);
    throw error;
  }
};

// Reset Password API
export const resetPassword = async (data) => {
  try {
    const response = await API.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    console.error('Reset Password Error:', error.response?.data || error.message);
    throw error;
  }
};

// Contact API
export const contact = async (data) => {
  try {
    const response = await API.post('/auth/contact', data);
    return response.data;
  } catch (error) {
    console.error('Contact Error:', error.response?.data || error.message);
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (updatedData) => {
  try {
    const sessionId = sessionStorage.getItem('sessionId');
    const authKey = getAuthKey(sessionId);

    if (!sessionId) {
      console.error('Session ID is missing in sessionStorage');
      throw new Error('Session ID is missing');
    }

    const userData = JSON.parse(sessionStorage.getItem(authKey)); // Fetch user-specific data

    if (!userData || !userData.token) {
      console.error(`Authentication token is missing for session: ${sessionId}`);
      throw new Error('Authentication token is missing');
    }

    console.log('Updated Data:', updatedData); // Log the payload being sent

    // Perform profile update
    const response = await API.put('/auth/profile', updatedData, {
      headers: {
                'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`, // Send token in Authorization header
      },
    });

    console.log('Response Data:', response.data); // Log the response from the backend

    // Update profile in sessionStorage
    const updatedProfile = response.data.user;
    sessionStorage.setItem(
      authKey,
      JSON.stringify({
        ...userData,
        profile: updatedProfile,
      })
    );

    return updatedProfile; // Return updated profile
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data); // Log backend error
    } else {
      console.error('Error Message:', error.message); // Log other errors
    }

    // Handle expired token
    if (error.response?.data?.error === 'Unauthorized: Token expired') {
      await refreshAuthToken();
      return updateUserProfile(updatedData); // Retry updating the profile
    }

    throw error; // Re-throw the error after logging
  }
};

export const getUserById = async (userId) => {
  try {
    const sessionId = sessionStorage.getItem('sessionId');
    const authKey = getAuthKey(sessionId);
    const userData = JSON.parse(sessionStorage.getItem(authKey)); // Fetch user-specific data

    if (!userData || !userData.token) {
      throw new Error('Authentication token is missing');
    }

    // Make the fetch call with the Authorization header
    const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${userData.token}`, // Pass the token in the header
      },
    });

    const text = await response.text(); // Get raw text response for debugging
    console.log('Response Text:', text); // Log raw response

    if (!response.ok) {
      throw new Error(`Failed to fetch. Status: ${response.status}`);
    }

    try {
      const data = JSON.parse(text); // Parse JSON if successful
      return data;
    } catch (parseError) {
      throw new Error('Failed to parse JSON response');
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Failed to fetch user data');
  }
};

