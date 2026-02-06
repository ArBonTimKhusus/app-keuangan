/**
 * ArBonKas API Client
 * Handles all communication with the backend API
 */

const API = (function() {
    // Configuration
    const config = {
        // Change this for production deployment
        baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api'
            : `${window.location.origin}/api`,
        tokenKey: 'arbonkas_token',
        userKey: 'arbonkas_user'
    };

    // Connection status
    let isOnline = navigator.onLine;
    const onlineCallbacks = [];
    const offlineCallbacks = [];

    // Monitor connection status
    window.addEventListener('online', () => {
        isOnline = true;
        onlineCallbacks.forEach(cb => cb());
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        offlineCallbacks.forEach(cb => cb());
    });

    // Token management
    function getToken() {
        return localStorage.getItem(config.tokenKey);
    }

    function setToken(token) {
        localStorage.setItem(config.tokenKey, token);
    }

    function removeToken() {
        localStorage.removeItem(config.tokenKey);
    }

    // User management
    function getUser() {
        const userStr = localStorage.getItem(config.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    function setUser(user) {
        localStorage.setItem(config.userKey, JSON.stringify(user));
    }

    function removeUser() {
        localStorage.removeItem(config.userKey);
    }

    // HTTP request helper
    async function request(endpoint, options = {}) {
        // Check connection
        if (!isOnline) {
            throw new Error('Tidak ada koneksi internet. Silakan periksa koneksi Anda.');
        }

        const url = `${config.baseURL}${endpoint}`;
        const token = getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            // Handle unauthorized (token expired or invalid)
            if (response.status === 401) {
                removeToken();
                removeUser();
                window.location.href = 'login.html';
                throw new Error(data.message || 'Sesi Anda telah berakhir. Silakan login kembali.');
            }

            // Handle other errors
            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan pada server');
            }

            return data;
        } catch (error) {
            // Network error
            if (error.message === 'Failed to fetch') {
                throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi.');
            }
            throw error;
        }
    }

    // API Methods
    return {
        // Configuration
        setBaseURL(url) {
            config.baseURL = url;
        },

        getBaseURL() {
            return config.baseURL;
        },

        // Connection status
        isOnline() {
            return isOnline;
        },

        onOnline(callback) {
            onlineCallbacks.push(callback);
        },

        onOffline(callback) {
            offlineCallbacks.push(callback);
        },

        // Auth APIs
        auth: {
            async register(name, email, password) {
                const data = await request('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });
                
                if (data.success && data.data.token) {
                    setToken(data.data.token);
                    setUser(data.data.user);
                }
                
                return data;
            },

            async login(email, password) {
                const data = await request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                if (data.success && data.data.token) {
                    setToken(data.data.token);
                    setUser(data.data.user);
                }
                
                return data;
            },

            async logout() {
                try {
                    await request('/auth/logout', { method: 'POST' });
                } finally {
                    removeToken();
                    removeUser();
                }
            },

            async getProfile() {
                const data = await request('/auth/me');
                if (data.success && data.data.user) {
                    setUser(data.data.user);
                }
                return data;
            },

            async updateProfile(updates) {
                const data = await request('/auth/profile', {
                    method: 'PUT',
                    body: JSON.stringify(updates)
                });
                
                if (data.success && data.data.user) {
                    setUser(data.data.user);
                }
                
                return data;
            },

            getToken,
            getUser,
            isAuthenticated() {
                return !!getToken();
            }
        },

        // Transaction APIs
        transactions: {
            async getAll(filters = {}) {
                const params = new URLSearchParams(filters);
                return await request(`/transactions?${params}`);
            },

            async getById(id) {
                return await request(`/transactions/${id}`);
            },

            async create(transactionData) {
                return await request('/transactions', {
                    method: 'POST',
                    body: JSON.stringify(transactionData)
                });
            },

            async update(id, transactionData) {
                return await request(`/transactions/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(transactionData)
                });
            },

            async delete(id) {
                return await request(`/transactions/${id}`, {
                    method: 'DELETE'
                });
            },

            async getSummary(startDate = null, endDate = null) {
                const params = new URLSearchParams();
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                return await request(`/transactions/summary?${params}`);
            }
        },

        // Wallet APIs
        wallets: {
            async getAll() {
                return await request('/wallets');
            },

            async getById(id) {
                return await request(`/wallets/${id}`);
            },

            async create(walletData) {
                return await request('/wallets', {
                    method: 'POST',
                    body: JSON.stringify(walletData)
                });
            },

            async update(id, walletData) {
                return await request(`/wallets/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(walletData)
                });
            },

            async delete(id) {
                return await request(`/wallets/${id}`, {
                    method: 'DELETE'
                });
            },

            async updateBalance(id, balance) {
                return await request(`/wallets/${id}/balance`, {
                    method: 'PATCH',
                    body: JSON.stringify({ balance })
                });
            }
        },

        // Category APIs
        categories: {
            async getAll(type = null) {
                const params = type ? `?type=${type}` : '';
                return await request(`/categories${params}`);
            },

            async getById(id) {
                return await request(`/categories/${id}`);
            },

            async create(categoryData) {
                return await request('/categories', {
                    method: 'POST',
                    body: JSON.stringify(categoryData)
                });
            },

            async update(id, categoryData) {
                return await request(`/categories/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(categoryData)
                });
            },

            async delete(id) {
                return await request(`/categories/${id}`, {
                    method: 'DELETE'
                });
            }
        },

        // Debt APIs
        debts: {
            async getAll(filters = {}) {
                const params = new URLSearchParams(filters);
                return await request(`/debts?${params}`);
            },

            async getById(id) {
                return await request(`/debts/${id}`);
            },

            async create(debtData) {
                return await request('/debts', {
                    method: 'POST',
                    body: JSON.stringify(debtData)
                });
            },

            async update(id, debtData) {
                return await request(`/debts/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(debtData)
                });
            },

            async delete(id) {
                return await request(`/debts/${id}`, {
                    method: 'DELETE'
                });
            },

            async markAsPaid(id, amount = null) {
                return await request(`/debts/${id}/pay`, {
                    method: 'PATCH',
                    body: JSON.stringify({ amount })
                });
            },

            async getSummary() {
                return await request('/debts/summary');
            },

            async getOverdue() {
                return await request('/debts/overdue');
            }
        },

        // Report APIs
        reports: {
            async getSummary(startDate = null, endDate = null) {
                const params = new URLSearchParams();
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                return await request(`/reports/summary?${params}`);
            },

            async byCategory(startDate = null, endDate = null, type = null) {
                const params = new URLSearchParams();
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                if (type) params.append('type', type);
                return await request(`/reports/by-category?${params}`);
            },

            async byWallet() {
                return await request('/reports/by-wallet');
            },

            async monthly(year = null) {
                const params = year ? `?year=${year}` : '';
                return await request(`/reports/monthly${params}`);
            },

            async expenseChart(startDate = null, endDate = null) {
                const params = new URLSearchParams();
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                return await request(`/reports/expense-chart?${params}`);
            },

            async incomeChart(startDate = null, endDate = null) {
                const params = new URLSearchParams();
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                return await request(`/reports/income-chart?${params}`);
            }
        }
    };
})();
