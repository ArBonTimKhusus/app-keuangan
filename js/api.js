/**
 * ArBonKas API Client
 * Handles all API communications with the backend
 */

const API = (() => {
  // ============================================================
  // Configuration
  // ============================================================
  
  const config = {
    // Base URL - change this for production deployment
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api'
      : `${window.location.protocol}//${window.location.hostname}/api`,
    
    // Token storage key
    tokenKey: 'arbonkas_auth_token',
    
    // User data storage key
    userKey: 'arbonkas_user_data'
  };

  // ============================================================
  // Token Management
  // ============================================================
  
  const getToken = () => localStorage.getItem(config.tokenKey);
  
  const setToken = (token) => localStorage.setItem(config.tokenKey, token);
  
  const removeToken = () => localStorage.removeItem(config.tokenKey);
  
  const getUser = () => {
    const userData = localStorage.getItem(config.userKey);
    return userData ? JSON.parse(userData) : null;
  };
  
  const setUser = (user) => localStorage.setItem(config.userKey, JSON.stringify(user));
  
  const removeUser = () => localStorage.removeItem(config.userKey);
  
  const isAuthenticated = () => !!getToken();

  // ============================================================
  // HTTP Client
  // ============================================================
  
  const request = async (endpoint, options = {}) => {
    const url = `${config.baseURL}${endpoint}`;
    const token = getToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        removeToken();
        removeUser();
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
        throw new Error(data.message || 'Unauthorized');
      }
      
      // Handle other error responses
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      // Network error or offline
      if (error.message === 'Failed to fetch') {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      throw error;
    }
  };
  
  const get = (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(url, { method: 'GET' });
  };
  
  const post = (endpoint, data = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
  
  const put = (endpoint, data = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  };
  
  const patch = (endpoint, data = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };
  
  const del = (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  };

  // ============================================================
  // Authentication API
  // ============================================================
  
  const auth = {
    register: async (name, email, password) => {
      const response = await post('/auth/register', { name, email, password });
      return response;
    },
    
    login: async (email, password) => {
      const response = await post('/auth/login', { email, password });
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
      return response;
    },
    
    logout: async () => {
      try {
        await post('/auth/logout');
      } catch (error) {
        // Ignore errors on logout
      } finally {
        removeToken();
        removeUser();
      }
    },
    
    me: async () => {
      const response = await get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      }
      return response;
    },
    
    updateProfile: async (profileData) => {
      const response = await put('/auth/profile', profileData);
      if (response.success && response.data) {
        setUser(response.data);
      }
      return response;
    }
  };

  // ============================================================
  // Wallet API
  // ============================================================
  
  const wallets = {
    getAll: () => get('/wallets'),
    
    getById: (id) => get(`/wallets/${id}`),
    
    create: (walletData) => post('/wallets', walletData),
    
    update: (id, walletData) => put(`/wallets/${id}`, walletData),
    
    delete: (id) => del(`/wallets/${id}`)
  };

  // ============================================================
  // Category API
  // ============================================================
  
  const categories = {
    getAll: (type = null) => {
      const params = type ? { type } : {};
      return get('/categories', params);
    },
    
    create: (categoryData) => post('/categories', categoryData),
    
    update: (id, categoryData) => put(`/categories/${id}`, categoryData),
    
    delete: (id) => del(`/categories/${id}`)
  };

  // ============================================================
  // Transaction API
  // ============================================================
  
  const transactions = {
    getAll: (filters = {}, page = 1, limit = 20) => {
      const params = { ...filters, page, limit };
      return get('/transactions', params);
    },
    
    getById: (id) => get(`/transactions/${id}`),
    
    create: (transactionData) => post('/transactions', transactionData),
    
    update: (id, transactionData) => put(`/transactions/${id}`, transactionData),
    
    delete: (id) => del(`/transactions/${id}`)
  };

  // ============================================================
  // Debt API
  // ============================================================
  
  const debts = {
    getAll: (filters = {}, page = 1, limit = 20) => {
      const params = { ...filters, page, limit };
      return get('/debts', params);
    },
    
    getSummary: () => get('/debts/summary'),
    
    getById: (id) => get(`/debts/${id}`),
    
    create: (debtData) => post('/debts', debtData),
    
    update: (id, debtData) => put(`/debts/${id}`, debtData),
    
    markAsPaid: (id) => patch(`/debts/${id}/pay`),
    
    delete: (id) => del(`/debts/${id}`)
  };

  // ============================================================
  // Report API
  // ============================================================
  
  const reports = {
    getSummary: (filters = {}) => get('/reports/summary', filters),
    
    getByCategory: (filters = {}) => get('/reports/by-category', filters),
    
    getByWallet: (filters = {}) => get('/reports/by-wallet', filters),
    
    getMonthly: (year = null) => {
      const params = year ? { year } : {};
      return get('/reports/monthly', params);
    }
  };

  // ============================================================
  // Health Check
  // ============================================================
  
  const checkConnection = async () => {
    try {
      const response = await fetch(`${config.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // ============================================================
  // Public API
  // ============================================================
  
  return {
    // Configuration
    config,
    
    // Auth helpers
    isAuthenticated,
    getUser,
    getToken,
    
    // API endpoints
    auth,
    wallets,
    categories,
    transactions,
    debts,
    reports,
    
    // Utilities
    checkConnection
  };
})();

// Make API available globally
window.API = API;
