/**
 * ArBonKas - Financial Report Application
 * JavaScript Implementation
 */

// Storage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'arbonkas_transactions',
    WALLETS: 'arbonkas_wallets',
    LOANS: 'arbonkas_loans'
};

// Application State
const AppState = {
    transactions: [],
    wallets: [],
    loans: [],
    currentPage: 'dashboard',
    editingTransaction: null
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

    // Escape HTML to prevent XSS
    escapeHtml: (str) => {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
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

// Local Storage Manager
const Storage = {
    _isAvailable: (() => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })(),

    save: (key, data) => {
        if (!Storage._isAvailable) return false;
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    load: (key) => {
        if (!Storage._isAvailable) return null;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    },

    clear: (key) => {
        if (!Storage._isAvailable) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Transaction Manager
const TransactionManager = {
    loadTransactions: () => {
        const transactions = Storage.load(STORAGE_KEYS.TRANSACTIONS);
        AppState.transactions = transactions || [];
        return AppState.transactions;
    },

    saveTransactions: () => {
        return Storage.save(STORAGE_KEYS.TRANSACTIONS, AppState.transactions);
    },

    addTransaction: (transaction) => {
        transaction.id = Utils.generateId();
        transaction.createdAt = new Date().toISOString();
        AppState.transactions.unshift(transaction);
        TransactionManager.saveTransactions();
        return transaction;
    },

    updateTransaction: (id, updates) => {
        const index = AppState.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            AppState.transactions[index] = { ...AppState.transactions[index], ...updates };
            TransactionManager.saveTransactions();
            return true;
        }
        return false;
    },

    deleteTransaction: (id) => {
        const index = AppState.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            AppState.transactions.splice(index, 1);
            TransactionManager.saveTransactions();
            return true;
        }
        return false;
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
    loadWallets: () => {
        const wallets = Storage.load(STORAGE_KEYS.WALLETS);
        AppState.wallets = wallets || [];
        
        // Create default wallet if none exists
        if (AppState.wallets.length === 0) {
            WalletManager.addWallet({
                name: 'Dompet Utama',
                balance: 0,
                icon: 'wallet'
            });
        }
        
        return AppState.wallets;
    },

    saveWallets: () => {
        return Storage.save(STORAGE_KEYS.WALLETS, AppState.wallets);
    },

    addWallet: (wallet) => {
        wallet.id = Utils.generateId();
        wallet.createdAt = new Date().toISOString();
        AppState.wallets.push(wallet);
        WalletManager.saveWallets();
        return wallet;
    },

    updateWallet: (id, updates) => {
        const index = AppState.wallets.findIndex(w => w.id === id);
        if (index !== -1) {
            AppState.wallets[index] = { ...AppState.wallets[index], ...updates };
            WalletManager.saveWallets();
            return true;
        }
        return false;
    },

    deleteWallet: (id) => {
        const index = AppState.wallets.findIndex(w => w.id === id);
        if (index !== -1) {
            AppState.wallets.splice(index, 1);
            WalletManager.saveWallets();
            return true;
        }
        return false;
    },

    getWalletBalance: (walletId) => {
        const transactions = AppState.transactions.filter(t => t.wallet === walletId);
        let balance = 0;
        
        const wallet = AppState.wallets.find(w => w.id === walletId);
        if (wallet) {
            balance = parseFloat(wallet.balance) || 0;
        }

        transactions.forEach(t => {
            if (t.type === 'income') {
                balance += parseFloat(t.amount);
            } else {
                balance -= parseFloat(t.amount);
            }
        });

        return balance;
    }
};

// Loan Manager
const LoanManager = {
    loadLoans: () => {
        const loans = Storage.load(STORAGE_KEYS.LOANS);
        AppState.loans = loans || [];
        return AppState.loans;
    },

    saveLoans: () => {
        return Storage.save(STORAGE_KEYS.LOANS, AppState.loans);
    },

    addLoan: (loan) => {
        loan.id = Utils.generateId();
        loan.createdAt = new Date().toISOString();
        loan.status = 'active';
        AppState.loans.unshift(loan);
        LoanManager.saveLoans();
        return loan;
    },

    updateLoan: (id, updates) => {
        const index = AppState.loans.findIndex(l => l.id === id);
        if (index !== -1) {
            AppState.loans[index] = { ...AppState.loans[index], ...updates };
            LoanManager.saveLoans();
            return true;
        }
        return false;
    },

    deleteLoan: (id) => {
        const index = AppState.loans.findIndex(l => l.id === id);
        if (index !== -1) {
            AppState.loans.splice(index, 1);
            LoanManager.saveLoans();
            return true;
        }
        return false;
    },

    getLoansByType: (type) => {
        return AppState.loans.filter(l => l.type === type);
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
                <div class="transaction-item ${Utils.escapeHtml(t.type)}">
                    <div class="transaction-info">
                        <div class="transaction-category">${Utils.escapeHtml(t.category)}</div>
                        <div class="transaction-details">
                            ${Utils.formatDate(t.date)} • ${Utils.escapeHtml(t.note) || 'Tidak ada catatan'}
                        </div>
                    </div>
                    <div class="transaction-amount ${Utils.escapeHtml(t.type)}">
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
                const wallet = AppState.wallets.find(w => w.id === t.wallet);
                const walletName = wallet ? wallet.name : 'Unknown';

                return `
                    <div class="transaction-item ${Utils.escapeHtml(t.type)}">
                        <div class="transaction-info">
                            <div class="transaction-category">${Utils.escapeHtml(t.category)}</div>
                            <div class="transaction-details">
                                ${Utils.formatDate(t.date)} • ${Utils.escapeHtml(walletName)} • ${Utils.escapeHtml(t.note) || 'Tidak ada catatan'}
                            </div>
                        </div>
                        <div class="transaction-amount ${Utils.escapeHtml(t.type)}">
                            ${t.type === 'income' ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button onclick="UIManager.editTransaction('${Utils.escapeHtml(t.id)}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="UIManager.deleteTransaction('${Utils.escapeHtml(t.id)}')" title="Hapus">
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
                                <i class="fas fa-${Utils.escapeHtml(w.icon)}"></i>
                            </div>
                        </div>
                        <div class="wallet-name">${Utils.escapeHtml(w.name)}</div>
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
        if (!select) return;
        select.innerHTML = '<option value="">Pilih Dompet</option>' +
            AppState.wallets.map(w => `<option value="${Utils.escapeHtml(w.id)}">${Utils.escapeHtml(w.name)}</option>`).join('');
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
            receivablesList.innerHTML = receivables.map(l => `
                <div class="loan-item">
                    <div class="loan-header">
                        <div class="loan-name">${Utils.escapeHtml(l.name)}</div>
                        <div class="loan-amount receivable">+ ${Utils.formatCurrency(l.amount)}</div>
                    </div>
                    <div class="loan-details">
                        Tanggal: ${Utils.formatDate(l.date)}
                        ${l.dueDate ? ` • Jatuh Tempo: ${Utils.formatDate(l.dueDate)}` : ''}
                    </div>
                    ${l.note ? `<div class="loan-details">${Utils.escapeHtml(l.note)}</div>` : ''}
                    <span class="loan-status ${Utils.escapeHtml(l.status)}">${l.status === 'active' ? 'Aktif' : 'Lunas'}</span>
                </div>
            `).join('');
        }

        // Render payables
        const payablesList = document.getElementById('payables-list');
        if (payables.length === 0) {
            payablesList.innerHTML = '<p class="empty-state">Belum ada hutang</p>';
        } else {
            payablesList.innerHTML = payables.map(l => `
                <div class="loan-item">
                    <div class="loan-header">
                        <div class="loan-name">${Utils.escapeHtml(l.name)}</div>
                        <div class="loan-amount payable">- ${Utils.formatCurrency(l.amount)}</div>
                    </div>
                    <div class="loan-details">
                        Tanggal: ${Utils.formatDate(l.date)}
                        ${l.dueDate ? ` • Jatuh Tempo: ${Utils.formatDate(l.dueDate)}` : ''}
                    </div>
                    ${l.note ? `<div class="loan-details">${Utils.escapeHtml(l.note)}</div>` : ''}
                    <span class="loan-status ${Utils.escapeHtml(l.status)}">${l.status === 'active' ? 'Aktif' : 'Lunas'}</span>
                </div>
            `).join('');
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
        document.getElementById('transaction-wallet').value = transaction.wallet;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-note').value = transaction.note || '';
        
        // Set type radio
        const typeRadio = document.querySelector(`input[name="type"][value="${transaction.type}"]`);
        if (typeRadio) typeRadio.checked = true;
        
        document.getElementById('transaction-modal-title').textContent = 'Edit Transaksi';
        UIManager.openModal('transaction-modal');
    },

    deleteTransaction: (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            TransactionManager.deleteTransaction(id);
            UIManager.refreshCurrentPage();
            UIManager.renderDashboard();
        }
    },

    // Generate Report
    generateReport: () => {
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
        
        let income = 0;
        let expense = 0;
        
        transactions.forEach(t => {
            if (t.type === 'income') {
                income += parseFloat(t.amount);
            } else {
                expense += parseFloat(t.amount);
            }
        });

        const balance = income - expense;

        // Render summary
        const summaryContent = document.getElementById('report-summary-content');
        summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">Total Pemasukan</div>
                    <div class="summary-value positive">${Utils.formatCurrency(income)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Pengeluaran</div>
                    <div class="summary-value negative">${Utils.formatCurrency(expense)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Saldo</div>
                    <div class="summary-value ${balance >= 0 ? 'positive' : 'negative'}">${Utils.formatCurrency(balance)}</div>
                </div>
            </div>
        `;

        // Render transactions
        const transactionsList = document.getElementById('report-transactions-list');
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-state">Tidak ada transaksi dalam periode ini</p>';
        } else {
            transactionsList.innerHTML = transactions.map(t => {
                const wallet = AppState.wallets.find(w => w.id === t.wallet);
                const walletName = wallet ? wallet.name : 'Unknown';

                return `
                    <div class="transaction-item ${Utils.escapeHtml(t.type)}">
                        <div class="transaction-info">
                            <div class="transaction-category">${Utils.escapeHtml(t.category)}</div>
                            <div class="transaction-details">
                                ${Utils.formatDate(t.date)} • ${Utils.escapeHtml(walletName)} • ${Utils.escapeHtml(t.note) || 'Tidak ada catatan'}
                            </div>
                        </div>
                        <div class="transaction-amount ${Utils.escapeHtml(t.type)}">
                            ${t.type === 'income' ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    exportReport: () => {
        alert('Fitur ekspor PDF akan segera hadir!');
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
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            AppState.editingTransaction = null;
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('transaction-modal-title').textContent = 'Tambah Transaksi';
            UIManager.openModal('transaction-modal');
        });

        // Add transaction button
        document.getElementById('add-transaction-btn').addEventListener('click', () => {
            AppState.editingTransaction = null;
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('transaction-modal-title').textContent = 'Tambah Transaksi';
            UIManager.openModal('transaction-modal');
        });

        // Add wallet button
        document.getElementById('add-wallet-btn').addEventListener('click', () => {
            document.getElementById('wallet-form').reset();
            UIManager.openModal('wallet-modal');
        });

        // Add loan button
        document.getElementById('add-loan-btn').addEventListener('click', () => {
            document.getElementById('loan-form').reset();
            document.getElementById('loan-date').value = new Date().toISOString().split('T')[0];
            UIManager.openModal('loan-modal');
        });

        // Close modal buttons
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                UIManager.closeModal(btn.dataset.modal);
            });
        });

        // Transaction form submit
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('transaction-id').value;
            const type = document.querySelector('input[name="type"]:checked').value;
            const amount = document.getElementById('transaction-amount').value;
            const category = document.getElementById('transaction-category').value;
            const wallet = document.getElementById('transaction-wallet').value;
            const date = document.getElementById('transaction-date').value;
            const note = document.getElementById('transaction-note').value;

            const transaction = { type, amount, category, wallet, date, note };

            if (id) {
                TransactionManager.updateTransaction(id, transaction);
            } else {
                TransactionManager.addTransaction(transaction);
            }

            UIManager.closeModal('transaction-modal');
            UIManager.refreshCurrentPage();
            UIManager.renderDashboard();
        });

        // Wallet form submit
        document.getElementById('wallet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('wallet-name').value;
            const balance = document.getElementById('wallet-balance').value;
            const icon = document.getElementById('wallet-icon').value;

            WalletManager.addWallet({ name, balance, icon });
            
            UIManager.closeModal('wallet-modal');
            UIManager.renderWallets();
        });

        // Loan form submit
        document.getElementById('loan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const type = document.querySelector('input[name="loan-type"]:checked').value;
            const name = document.getElementById('loan-name').value;
            const amount = document.getElementById('loan-amount').value;
            const date = document.getElementById('loan-date').value;
            const dueDate = document.getElementById('loan-due-date').value;
            const note = document.getElementById('loan-note').value;

            LoanManager.addLoan({ type, name, amount, date, dueDate, note });
            
            UIManager.closeModal('loan-modal');
            UIManager.renderLoans();
        });

        // Transaction filter
        document.getElementById('transaction-filter').addEventListener('change', () => {
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
                document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            });
        });

        // Report period change
        document.getElementById('report-period').addEventListener('change', (e) => {
            const customDateRange = document.querySelector('.custom-date-range');
            if (e.target.value === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
            }
        });

        // Generate report button
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            UIManager.generateReport();
        });

        // Export report button
        document.getElementById('export-report-btn').addEventListener('click', () => {
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
    }
};

// Application Initialization
const App = {
    init: () => {
        console.log('ArBonKas Application Starting...');
        
        // Load data from localStorage
        TransactionManager.loadTransactions();
        WalletManager.loadWallets();
        LoanManager.loadLoans();

        // Initialize event handlers
        EventHandlers.init();

        // Set initial date for transaction form
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];

        // Render initial page
        UIManager.renderDashboard();
        UIManager.renderWallets();

        console.log('ArBonKas Application Ready!');
    }
};

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
