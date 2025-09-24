import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Configure axios defaults
axios.defaults.baseURL = `${API_BASE_URL}/api`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get('/user/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          // If token is invalid, clear it
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user_type, user_id } = response.data;
      
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Load user profile after login
      const profileResponse = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      const { access_token, user_type, user_id } = response.data;
      
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      // Load user profile after registration
      const profileResponse = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      await axios.put('/user/profile', profileData);
      
      // Reload user profile
      const response = await axios.get('/user/profile');
      setUser(response.data);
      
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Profile update failed'
      };
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/user/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reload user profile to get updated image
      const profileResponse = await axios.get('/user/profile');
      setUser(profileResponse.data);
      
      return { success: true, imageUrl: response.data.image_url };
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Image upload failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};