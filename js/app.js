/**
 * ArBonKas - Financial Report Application
 * JavaScript Implementation
 */

// Application State
const AppState = {
    transactions: [],
    wallets: [],
    loans: [],
    categories: [],
    currentPage: 'dashboard',
    editingTransaction: null,
    user: null
};

// Utility Functions
const Utils = {
    // Format currency to Indonesian Rupiah
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format date to Indonesian format
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    // Get date range based on period
    getDateRange: (period) => {
        const today = new Date();
        const start = new Date();
        let end = new Date();

        switch(period) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'week':
                start.setDate(today.getDate() - today.getDay());
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(today.getFullYear(), 11, 31);
                end.setHours(23, 59, 59, 999);
                break;
        }

        return { start, end };
    }
};

// UI Helper Functions
const UIHelpers = {
    showLoading: () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('active');
    },

    hideLoading: () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    showToast: (message, type = 'info') => {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    updateConnectionStatus: () => {
        const status = document.getElementById('connection-status');
        if (!status) return;

        if (API.isOnline()) {
            status.textContent = 'Online';
            status.className = 'connection-status online';
        } else {
            status.textContent = 'Offline';
            status.className = 'connection-status offline';
        }
    }
};

// Transaction Manager
const TransactionManager = {
    loadTransactions: async () => {
        try {
            UIHelpers.showLoading();
            const response = await API.transactions.getAll();
            if (response.success) {
                AppState.transactions = response.data.transactions || [];
            }
            return AppState.transactions;
        } catch (error) {
            console.error('Error loading transactions:', error);
            UIHelpers.showToast(error.message || 'Gagal memuat transaksi', 'error');
            AppState.transactions = [];
            return [];
        } finally {
            UIHelpers.hideLoading();
        }
    },

    addTransaction: async (transaction) => {
        try {
            UIHelpers.showLoading();
            const response = await API.transactions.create(transaction);
            if (response.success) {
                AppState.transactions.unshift(response.data.transaction);
                UIHelpers.showToast('Transaksi berhasil ditambahkan', 'success');
                return response.data.transaction;
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            UIHelpers.showToast(error.message || 'Gagal menambahkan transaksi', 'error');
            throw error;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    updateTransaction: async (id, updates) => {
        try {
            UIHelpers.showLoading();
            const response = await API.transactions.update(id, updates);
            if (response.success) {
                const index = AppState.transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    AppState.transactions[index] = response.data.transaction;
                }
                UIHelpers.showToast('Transaksi berhasil diperbarui', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            UIHelpers.showToast(error.message || 'Gagal memperbarui transaksi', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    deleteTransaction: async (id) => {
        try {
            UIHelpers.showLoading();
            const response = await API.transactions.delete(id);
            if (response.success) {
                const index = AppState.transactions.findIndex(t => t.id === id);
                if (index !== -1) {
                    AppState.transactions.splice(index, 1);
                }
                UIHelpers.showToast('Transaksi berhasil dihapus', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            UIHelpers.showToast(error.message || 'Gagal menghapus transaksi', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    getTransactionsByType: (type) => {
        if (type === 'all') return AppState.transactions;
        return AppState.transactions.filter(t => t.type === type);
    },

    getTransactionsByDateRange: (start, end) => {
        return AppState.transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });
    },

    getTotalsByType: () => {
        let income = 0;
        let expense = 0;

        AppState.transactions.forEach(t => {
            if (t.type === 'income') {
                income += parseFloat(t.amount);
            } else {
                expense += parseFloat(t.amount);
            }
        });

        return { income, expense, balance: income - expense };
    }
};

// Wallet Manager
const WalletManager = {
    loadWallets: async () => {
        try {
            UIHelpers.showLoading();
            const response = await API.wallets.getAll();
            if (response.success) {
                AppState.wallets = response.data.wallets || [];
            }
            return AppState.wallets;
        } catch (error) {
            console.error('Error loading wallets:', error);
            UIHelpers.showToast(error.message || 'Gagal memuat dompet', 'error');
            AppState.wallets = [];
            return [];
        } finally {
            UIHelpers.hideLoading();
        }
    },

    addWallet: async (wallet) => {
        try {
            UIHelpers.showLoading();
            const response = await API.wallets.create(wallet);
            if (response.success) {
                AppState.wallets.push(response.data.wallet);
                UIHelpers.showToast('Dompet berhasil ditambahkan', 'success');
                return response.data.wallet;
            }
        } catch (error) {
            console.error('Error adding wallet:', error);
            UIHelpers.showToast(error.message || 'Gagal menambahkan dompet', 'error');
            throw error;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    updateWallet: async (id, updates) => {
        try {
            UIHelpers.showLoading();
            const response = await API.wallets.update(id, updates);
            if (response.success) {
                const index = AppState.wallets.findIndex(w => w.id === id);
                if (index !== -1) {
                    AppState.wallets[index] = response.data.wallet;
                }
                UIHelpers.showToast('Dompet berhasil diperbarui', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
            UIHelpers.showToast(error.message || 'Gagal memperbarui dompet', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    deleteWallet: async (id) => {
        try {
            UIHelpers.showLoading();
            const response = await API.wallets.delete(id);
            if (response.success) {
                const index = AppState.wallets.findIndex(w => w.id === id);
                if (index !== -1) {
                    AppState.wallets.splice(index, 1);
                }
                UIHelpers.showToast('Dompet berhasil dihapus', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error deleting wallet:', error);
            UIHelpers.showToast(error.message || 'Gagal menghapus dompet', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    getWalletBalance: (walletId) => {
        const wallet = AppState.wallets.find(w => w.id === walletId);
        return wallet ? parseFloat(wallet.balance) || 0 : 0;
    }
};

// Loan Manager
const LoanManager = {
    loadLoans: async () => {
        try {
            UIHelpers.showLoading();
            const response = await API.debts.getAll();
            if (response.success) {
                AppState.loans = response.data.debts || [];
            }
            return AppState.loans;
        } catch (error) {
            console.error('Error loading loans:', error);
            UIHelpers.showToast(error.message || 'Gagal memuat hutang/piutang', 'error');
            AppState.loans = [];
            return [];
        } finally {
            UIHelpers.hideLoading();
        }
    },

    addLoan: async (loan) => {
        try {
            UIHelpers.showLoading();
            const response = await API.debts.create(loan);
            if (response.success) {
                AppState.loans.unshift(response.data.debt);
                UIHelpers.showToast('Hutang/piutang berhasil ditambahkan', 'success');
                return response.data.debt;
            }
        } catch (error) {
            console.error('Error adding loan:', error);
            UIHelpers.showToast(error.message || 'Gagal menambahkan hutang/piutang', 'error');
            throw error;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    updateLoan: async (id, updates) => {
        try {
            UIHelpers.showLoading();
            const response = await API.debts.update(id, updates);
            if (response.success) {
                const index = AppState.loans.findIndex(l => l.id === id);
                if (index !== -1) {
                    AppState.loans[index] = response.data.debt;
                }
                UIHelpers.showToast('Hutang/piutang berhasil diperbarui', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error updating loan:', error);
            UIHelpers.showToast(error.message || 'Gagal memperbarui hutang/piutang', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    deleteLoan: async (id) => {
        try {
            UIHelpers.showLoading();
            const response = await API.debts.delete(id);
            if (response.success) {
                const index = AppState.loans.findIndex(l => l.id === id);
                if (index !== -1) {
                    AppState.loans.splice(index, 1);
                }
                UIHelpers.showToast('Hutang/piutang berhasil dihapus', 'success');
                return true;
            }
        } catch (error) {
            console.error('Error deleting loan:', error);
            UIHelpers.showToast(error.message || 'Gagal menghapus hutang/piutang', 'error');
            return false;
        } finally {
            UIHelpers.hideLoading();
        }
    },

    getLoansByType: (type) => {
        return AppState.loans.filter(l => l.type === type);
    }
};

// Category Manager
const CategoryManager = {
    loadCategories: async () => {
        try {
            const response = await API.categories.getAll();
            if (response.success) {
                AppState.categories = response.data.categories || [];
            }
            return AppState.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            AppState.categories = [];
            return [];
        }
    },

    getCategoriesByType: (type) => {
        return AppState.categories.filter(c => c.type === type);
    },

    updateCategoryOptions: () => {
        const select = document.getElementById('transaction-category');
        if (!select) return;

        const type = document.querySelector('input[name="type"]:checked')?.value || 'expense';
        const categories = CategoryManager.getCategoriesByType(type);
        
        select.innerHTML = '<option value="">Pilih Kategori</option>' +
            categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
};

// UI Manager
const UIManager = {
    // Navigation
    switchPage: (pageName) => {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === pageName) {
                btn.classList.add('active');
            }
        });

        AppState.currentPage = pageName;

        // Refresh page content
        UIManager.refreshCurrentPage();
    },

    refreshCurrentPage: () => {
        switch(AppState.currentPage) {
            case 'dashboard':
                UIManager.renderDashboard();
                break;
            case 'transactions':
                UIManager.renderTransactions();
                break;
            case 'wallets':
                UIManager.renderWallets();
                break;
            case 'loans':
                UIManager.renderLoans();
                break;
        }
    },

    // Dashboard
    renderDashboard: () => {
        const totals = TransactionManager.getTotalsByType();
        
        document.getElementById('total-income').textContent = Utils.formatCurrency(totals.income);
        document.getElementById('total-expense').textContent = Utils.formatCurrency(totals.expense);
        document.getElementById('total-balance').textContent = Utils.formatCurrency(totals.balance);

        // Render recent transactions
        const recentList = document.getElementById('recent-transactions-list');
        const recentTransactions = AppState.transactions.slice(0, 5);

        if (recentTransactions.length === 0) {
            recentList.innerHTML = '<p class="empty-state">Belum ada transaksi</p>';
        } else {
            recentList.innerHTML = recentTransactions.map(t => `
                <div class="transaction-item ${t.type}">
                    <div class="transaction-info">
                        <div class="transaction-category">${t.category}</div>
                        <div class="transaction-details">
                            ${Utils.formatDate(t.date)} • ${t.note || 'Tidak ada catatan'}
                        </div>
                    </div>
                    <div class="transaction-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                    </div>
                </div>
            `).join('');
        }
    },

    // Transactions
    renderTransactions: () => {
        const filterValue = document.getElementById('transaction-filter').value;
        const transactions = TransactionManager.getTransactionsByType(filterValue);
        const list = document.getElementById('transactions-list');

        if (transactions.length === 0) {
            list.innerHTML = '<p class="empty-state">Belum ada transaksi</p>';
        } else {
            list.innerHTML = transactions.map(t => {
                const wallet = AppState.wallets.find(w => w.id === (t.wallet_id || t.wallet));
                const walletName = wallet ? wallet.name : 'Unknown';

                return `
                    <div class="transaction-item ${t.type}">
                        <div class="transaction-info">
                            <div class="transaction-category">${t.category}</div>
                            <div class="transaction-details">
                                ${Utils.formatDate(t.date)} • ${walletName} • ${t.note || 'Tidak ada catatan'}
                            </div>
                        </div>
                        <div class="transaction-amount ${t.type}">
                            ${t.type === 'income' ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button onclick="UIManager.editTransaction('${t.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="UIManager.deleteTransaction('${t.id}')" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    // Wallets
    renderWallets: () => {
        const list = document.getElementById('wallets-list');
        
        if (AppState.wallets.length === 0) {
            list.innerHTML = '<p class="empty-state">Belum ada dompet</p>';
        } else {
            list.innerHTML = AppState.wallets.map(w => {
                const balance = WalletManager.getWalletBalance(w.id);
                return `
                    <div class="wallet-card">
                        <div class="wallet-header">
                            <div class="wallet-icon">
                                <i class="fas fa-${w.icon}"></i>
                            </div>
                        </div>
                        <div class="wallet-name">${w.name}</div>
                        <div class="wallet-balance">${Utils.formatCurrency(balance)}</div>
                    </div>
                `;
            }).join('');
        }

        // Update wallet options in transaction form
        UIManager.updateWalletOptions();
    },

    updateWalletOptions: () => {
        const select = document.getElementById('transaction-wallet');
        select.innerHTML = '<option value="">Pilih Dompet</option>' +
            AppState.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    },

    // Loans
    renderLoans: () => {
        const receivables = LoanManager.getLoansByType('receivable');
        const payables = LoanManager.getLoansByType('payable');

        // Render receivables
        const receivablesList = document.getElementById('receivables-list');
        if (receivables.length === 0) {
            receivablesList.innerHTML = '<p class="empty-state">Belum ada piutang</p>';
        } else {
            receivablesList.innerHTML = receivables.map(l => {
                const dueDate = l.due_date || l.dueDate;
                return `
                    <div class="loan-item">
                        <div class="loan-header">
                            <div class="loan-name">${l.name}</div>
                            <div class="loan-amount receivable">+ ${Utils.formatCurrency(l.amount)}</div>
                        </div>
                        <div class="loan-details">
                            Tanggal: ${Utils.formatDate(l.date)}
                            ${dueDate ? ` • Jatuh Tempo: ${Utils.formatDate(dueDate)}` : ''}
                        </div>
                        ${l.note ? `<div class="loan-details">${l.note}</div>` : ''}
                        <span class="loan-status ${l.status}">${l.status === 'active' ? 'Aktif' : 'Lunas'}</span>
                    </div>
                `;
            }).join('');
        }

        // Render payables
        const payablesList = document.getElementById('payables-list');
        if (payables.length === 0) {
            payablesList.innerHTML = '<p class="empty-state">Belum ada hutang</p>';
        } else {
            payablesList.innerHTML = payables.map(l => {
                const dueDate = l.due_date || l.dueDate;
                return `
                    <div class="loan-item">
                        <div class="loan-header">
                            <div class="loan-name">${l.name}</div>
                            <div class="loan-amount payable">- ${Utils.formatCurrency(l.amount)}</div>
                        </div>
                        <div class="loan-details">
                            Tanggal: ${Utils.formatDate(l.date)}
                            ${dueDate ? ` • Jatuh Tempo: ${Utils.formatDate(dueDate)}` : ''}
                        </div>
                        ${l.note ? `<div class="loan-details">${l.note}</div>` : ''}
                        <span class="loan-status ${l.status}">${l.status === 'active' ? 'Aktif' : 'Lunas'}</span>
                    </div>
                `;
            }).join('');
        }
    },

    // Modals
    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Transaction Operations
    editTransaction: (id) => {
        const transaction = AppState.transactions.find(t => t.id === id);
        if (!transaction) return;

        AppState.editingTransaction = id;
        
        // Fill form
        document.getElementById('transaction-id').value = id;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-wallet').value = transaction.wallet_id || transaction.wallet;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-note').value = transaction.note || '';
        
        // Set type radio
        document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
        
        document.getElementById('transaction-modal-title').textContent = 'Edit Transaksi';
        UIManager.openModal('transaction-modal');
    },

    deleteTransaction: async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const success = await TransactionManager.deleteTransaction(id);
            if (success) {
                UIManager.refreshCurrentPage();
                if (AppState.currentPage === 'dashboard') {
                    UIManager.renderDashboard();
                }
            }
        }
    },

    // Generate Report
    generateReport: async () => {
        const period = document.getElementById('report-period').value;
        let start, end;

        if (period === 'custom') {
            start = new Date(document.getElementById('report-start-date').value);
            end = new Date(document.getElementById('report-end-date').value);
        } else {
            const range = Utils.getDateRange(period);
            start = range.start;
            end = range.end;
        }

        try {
            UIHelpers.showLoading();
            
            const startDate = start.toISOString().split('T')[0];
            const endDate = end.toISOString().split('T')[0];
            
            const response = await API.reports.getSummary(startDate, endDate);
            
            if (response.success) {
                const summary = response.data.summary;
                
                // Render summary
                const summaryContent = document.getElementById('report-summary-content');
                summaryContent.innerHTML = `
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Total Pemasukan</div>
                            <div class="summary-value positive">${Utils.formatCurrency(summary.total_income || 0)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Pengeluaran</div>
                            <div class="summary-value negative">${Utils.formatCurrency(summary.total_expense || 0)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Saldo</div>
                            <div class="summary-value ${summary.balance >= 0 ? 'positive' : 'negative'}">${Utils.formatCurrency(summary.balance || 0)}</div>
                        </div>
                    </div>
                `;

                // Get transactions for the period
                const transactions = TransactionManager.getTransactionsByDateRange(start, end);
                
                // Render transactions
                const transactionsList = document.getElementById('report-transactions-list');
                if (transactions.length === 0) {
                    transactionsList.innerHTML = '<p class="empty-state">Tidak ada transaksi dalam periode ini</p>';
                } else {
                    transactionsList.innerHTML = transactions.map(t => {
                        const wallet = AppState.wallets.find(w => w.id === (t.wallet_id || t.wallet));
                        const walletName = wallet ? wallet.name : 'Unknown';

                        return `
                            <div class="transaction-item ${t.type}">
                                <div class="transaction-info">
                                    <div class="transaction-category">${t.category}</div>
                                    <div class="transaction-details">
                                        ${Utils.formatDate(t.date)} • ${walletName} • ${t.note || 'Tidak ada catatan'}
                                    </div>
                                </div>
                                <div class="transaction-amount ${t.type}">
                                    ${t.type === 'income' ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
                
                UIHelpers.showToast('Laporan berhasil dibuat', 'success');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            UIHelpers.showToast(error.message || 'Gagal membuat laporan', 'error');
        } finally {
            UIHelpers.hideLoading();
        }
    },

    exportReport: async () => {
        try {
            UIHelpers.showLoading();
            
            const period = document.getElementById('report-period').value;
            let start, end;

            if (period === 'custom') {
                start = new Date(document.getElementById('report-start-date').value);
                end = new Date(document.getElementById('report-end-date').value);
            } else {
                const range = Utils.getDateRange(period);
                start = range.start;
                end = range.end;
            }

            const transactions = TransactionManager.getTransactionsByDateRange(start, end);
            const totals = TransactionManager.getTotalsByType();

            // Create CSV content
            let csv = 'Tanggal,Tipe,Kategori,Dompet,Jumlah,Catatan\n';
            transactions.forEach(t => {
                const wallet = AppState.wallets.find(w => w.id === (t.wallet_id || t.wallet));
                const walletName = wallet ? wallet.name : 'Unknown';
                csv += `${t.date},${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'},${t.category},${walletName},${t.amount},"${t.note || ''}"\n`;
            });

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            UIHelpers.showToast('Laporan berhasil diekspor', 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            UIHelpers.showToast('Gagal mengekspor laporan', 'error');
        } finally {
            UIHelpers.hideLoading();
        }
    }
};

// Event Handlers
const EventHandlers = {
    init: () => {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                UIManager.switchPage(btn.dataset.page);
            });
        });

        // Quick add button
        document.getElementById('quick-add-btn')?.addEventListener('click', () => {
            AppState.editingTransaction = null;
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-id').value = '';
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('transaction-modal-title').textContent = 'Tambah Transaksi';
            CategoryManager.updateCategoryOptions();
            UIManager.openModal('transaction-modal');
        });

        // Add transaction button
        document.getElementById('add-transaction-btn')?.addEventListener('click', () => {
            AppState.editingTransaction = null;
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-id').value = '';
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('transaction-modal-title').textContent = 'Tambah Transaksi';
            CategoryManager.updateCategoryOptions();
            UIManager.openModal('transaction-modal');
        });

        // Add wallet button
        document.getElementById('add-wallet-btn')?.addEventListener('click', () => {
            document.getElementById('wallet-form').reset();
            UIManager.openModal('wallet-modal');
        });

        // Add loan button
        document.getElementById('add-loan-btn')?.addEventListener('click', () => {
            document.getElementById('loan-form').reset();
            document.getElementById('loan-date').value = new Date().toISOString().split('T')[0];
            UIManager.openModal('loan-modal');
        });

        // Logout button
        document.getElementById('logout-link')?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                try {
                    UIHelpers.showLoading();
                    await API.auth.logout();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error logging out:', error);
                    UIHelpers.showToast('Gagal keluar. Silakan coba lagi.', 'error');
                } finally {
                    UIHelpers.hideLoading();
                }
            }
        });

        // Close modal buttons
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                UIManager.closeModal(btn.dataset.modal);
            });
        });

        // Transaction type change - update categories
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                CategoryManager.updateCategoryOptions();
            });
        });

        // Transaction form submit
        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('transaction-id').value;
            const type = document.querySelector('input[name="type"]:checked').value;
            const amount = document.getElementById('transaction-amount').value;
            const category = document.getElementById('transaction-category').value;
            const wallet_id = document.getElementById('transaction-wallet').value;
            const date = document.getElementById('transaction-date').value;
            const note = document.getElementById('transaction-note').value;

            const transaction = { type, amount, category, wallet_id, date, note };

            try {
                if (id) {
                    await TransactionManager.updateTransaction(id, transaction);
                } else {
                    await TransactionManager.addTransaction(transaction);
                }

                UIManager.closeModal('transaction-modal');
                UIManager.refreshCurrentPage();
                if (AppState.currentPage !== 'dashboard') {
                    UIManager.renderDashboard();
                }
            } catch (error) {
                console.error('Error saving transaction:', error);
            }
        });

        // Wallet form submit
        document.getElementById('wallet-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('wallet-name').value;
            const balance = document.getElementById('wallet-balance').value;
            const icon = document.getElementById('wallet-icon').value;

            try {
                await WalletManager.addWallet({ name, balance, icon });
                UIManager.closeModal('wallet-modal');
                UIManager.renderWallets();
            } catch (error) {
                console.error('Error saving wallet:', error);
            }
        });

        // Loan form submit
        document.getElementById('loan-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const type = document.querySelector('input[name="loan-type"]:checked').value;
            const name = document.getElementById('loan-name').value;
            const amount = document.getElementById('loan-amount').value;
            const date = document.getElementById('loan-date').value;
            const dueDate = document.getElementById('loan-due-date').value;
            const note = document.getElementById('loan-note').value;

            try {
                await LoanManager.addLoan({ type, name, amount, date, due_date: dueDate, note });
                UIManager.closeModal('loan-modal');
                UIManager.renderLoans();
            } catch (error) {
                console.error('Error saving loan:', error);
            }
        });

        // Transaction filter
        document.getElementById('transaction-filter')?.addEventListener('change', () => {
            UIManager.renderTransactions();
        });

        // Loans tabs
        document.querySelectorAll('.loans-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update tab buttons
                document.querySelectorAll('.loans-tabs .tab-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                // Update tab content
                document.querySelectorAll('#loans-page .tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.getElementById(`${btn.dataset.tab}-tab`)?.classList.add('active');
            });
        });

        // Report period change
        document.getElementById('report-period')?.addEventListener('change', (e) => {
            const customDateRange = document.querySelector('.custom-date-range');
            if (customDateRange) {
                if (e.target.value === 'custom') {
                    customDateRange.style.display = 'flex';
                } else {
                    customDateRange.style.display = 'none';
                }
            }
        });

        // Generate report button
        document.getElementById('generate-report-btn')?.addEventListener('click', () => {
            UIManager.generateReport();
        });

        // Export report button
        document.getElementById('export-report-btn')?.addEventListener('click', () => {
            UIManager.exportReport();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Connection status monitoring
        API.onOnline(() => {
            UIHelpers.updateConnectionStatus();
            UIHelpers.showToast('Koneksi internet tersambung kembali', 'success');
        });

        API.onOffline(() => {
            UIHelpers.updateConnectionStatus();
            UIHelpers.showToast('Koneksi internet terputus', 'warning');
        });
    }
};

// Application Initialization
const App = {
    loadUserProfile: async () => {
        try {
            const user = API.auth.getUser();
            if (user) {
                AppState.user = user;
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = user.name || user.email;
                }
            } else {
                // Fetch fresh profile
                const response = await API.auth.getProfile();
                if (response.success && response.data.user) {
                    AppState.user = response.data.user;
                    const userNameElement = document.getElementById('user-name');
                    if (userNameElement) {
                        userNameElement.textContent = response.data.user.name || response.data.user.email;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    },

    init: async () => {
        console.log('ArBonKas Application Starting...');
        
        try {
            UIHelpers.showLoading();
            UIHelpers.updateConnectionStatus();

            // Load user profile
            await App.loadUserProfile();

            // Load all data from API in parallel
            await Promise.all([
                CategoryManager.loadCategories(),
                WalletManager.loadWallets(),
                TransactionManager.loadTransactions(),
                LoanManager.loadLoans()
            ]);

            // Initialize event handlers
            EventHandlers.init();

            // Set initial date for transaction form
            const transactionDate = document.getElementById('transaction-date');
            if (transactionDate) {
                transactionDate.value = new Date().toISOString().split('T')[0];
            }

            // Update wallet and category options
            UIManager.updateWalletOptions();
            CategoryManager.updateCategoryOptions();

            // Render initial page
            UIManager.renderDashboard();
            UIManager.renderWallets();

            console.log('ArBonKas Application Ready!');
            UIHelpers.showToast('Aplikasi berhasil dimuat', 'success');
        } catch (error) {
            console.error('Error initializing application:', error);
            UIHelpers.showToast('Gagal memuat aplikasi. Silakan refresh halaman.', 'error');
        } finally {
            UIHelpers.hideLoading();
        }
    }
};

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
