/**
 * Report Controller
 * Handles all report and analytics operations
 */

const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Debt = require('../models/Debt');
const response = require('../utils/response');

const reportController = {
    /**
     * Get financial summary
     * GET /api/reports/summary
     */
    async getSummary(req, res, next) {
        try {
            const userId = req.user.id;
            const { start_date, end_date } = req.query;
            
            // Get transaction summary
            const transactionSummary = await Transaction.getSummary(userId, start_date, end_date);
            
            // Get wallet summary
            const totalBalance = await Wallet.getTotalBalance(userId);
            
            // Get debt summary
            const debtSummary = await Debt.getSummary(userId);
            
            const summary = {
                transactions: transactionSummary,
                total_wallet_balance: totalBalance,
                debts: debtSummary,
                net_worth: totalBalance - debtSummary.total_hutang + debtSummary.total_piutang
            };
            
            return response.success(res, summary, 'Ringkasan keuangan berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get breakdown by category
     * GET /api/reports/by-category
     */
    async byCategory(req, res, next) {
        try {
            const userId = req.user.id;
            const { start_date, end_date, type } = req.query;
            
            const categoryBreakdown = await Transaction.groupByCategory(userId, start_date, end_date);
            
            // Filter by type if specified
            let filteredData = categoryBreakdown;
            if (type === 'income' || type === 'expense') {
                filteredData = categoryBreakdown.filter(cat => 
                    cat.type === type || cat.type === 'both'
                );
            }
            
            return response.success(res, filteredData, 'Laporan per kategori berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get breakdown by wallet
     * GET /api/reports/by-wallet
     */
    async byWallet(req, res, next) {
        try {
            const userId = req.user.id;
            
            const wallets = await Wallet.findAll(userId);
            
            // Get transaction count and totals for each wallet
            const walletReports = await Promise.all(
                wallets.map(async (wallet) => {
                    const stats = await Wallet.findByIdWithStats(wallet.id, userId);
                    return stats;
                })
            );
            
            return response.success(res, walletReports, 'Laporan per dompet berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get monthly trend
     * GET /api/reports/monthly
     */
    async monthly(req, res, next) {
        try {
            const userId = req.user.id;
            const year = req.query.year || new Date().getFullYear();
            
            const monthlyData = await Transaction.getMonthlyTrend(userId, year);
            
            // Fill in missing months with zeros
            const fullYearData = [];
            for (let month = 1; month <= 12; month++) {
                const existing = monthlyData.find(d => d.month === month);
                if (existing) {
                    fullYearData.push(existing);
                } else {
                    fullYearData.push({
                        month,
                        year: parseInt(year),
                        total_income: 0,
                        total_expense: 0,
                        balance: 0
                    });
                }
            }
            
            return response.success(res, fullYearData, 'Laporan bulanan berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get expense by category for chart
     * GET /api/reports/expense-chart
     */
    async expenseChart(req, res, next) {
        try {
            const userId = req.user.id;
            const { start_date, end_date } = req.query;
            
            const categoryBreakdown = await Transaction.groupByCategory(userId, start_date, end_date);
            
            // Filter only expense categories
            const expenseData = categoryBreakdown
                .filter(cat => cat.type === 'expense' || cat.type === 'both')
                .filter(cat => cat.total_amount > 0)
                .sort((a, b) => b.total_amount - a.total_amount);
            
            // Calculate percentages
            const total = expenseData.reduce((sum, cat) => sum + cat.total_amount, 0);
            const chartData = expenseData.map(cat => ({
                ...cat,
                percentage: total > 0 ? (cat.total_amount / total * 100).toFixed(2) : 0
            }));
            
            return response.success(res, {
                data: chartData,
                total_expense: total
            }, 'Data chart pengeluaran berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    },
    
    /**
     * Get income by category for chart
     * GET /api/reports/income-chart
     */
    async incomeChart(req, res, next) {
        try {
            const userId = req.user.id;
            const { start_date, end_date } = req.query;
            
            const categoryBreakdown = await Transaction.groupByCategory(userId, start_date, end_date);
            
            // Filter only income categories
            const incomeData = categoryBreakdown
                .filter(cat => cat.type === 'income' || cat.type === 'both')
                .filter(cat => cat.total_amount > 0)
                .sort((a, b) => b.total_amount - a.total_amount);
            
            // Calculate percentages
            const total = incomeData.reduce((sum, cat) => sum + cat.total_amount, 0);
            const chartData = incomeData.map(cat => ({
                ...cat,
                percentage: total > 0 ? (cat.total_amount / total * 100).toFixed(2) : 0
            }));
            
            return response.success(res, {
                data: chartData,
                total_income: total
            }, 'Data chart pemasukan berhasil diambil');
            
        } catch (error) {
            next(error);
        }
    }
};

module.exports = reportController;
