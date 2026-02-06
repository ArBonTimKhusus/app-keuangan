/**
 * Report Controller
 */

const { query } = require('../config/database');
const { success } = require('../utils/response');
const { getDateRange } = require('../utils/helpers');

const ReportController = {
  /**
   * Get summary report (total income, expense, balance)
   */
  getSummary: async (req, res, next) => {
    try {
      const { start_date, end_date, period } = req.query;
      
      let dateFilter = '';
      const params = [req.user.id];
      
      if (period) {
        const { start, end } = getDateRange(period);
        dateFilter = ' AND date >= ? AND date <= ?';
        params.push(start, end);
      } else if (start_date && end_date) {
        dateFilter = ' AND date >= ? AND date <= ?';
        params.push(start_date, end_date);
      }
      
      const [summary] = await query(
        `SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(*) as total_transactions
         FROM transactions 
         WHERE user_id = ?${dateFilter}`,
        params
      );
      
      const totalIncome = parseFloat(summary.total_income) || 0;
      const totalExpense = parseFloat(summary.total_expense) || 0;
      const balance = totalIncome - totalExpense;
      
      const reportData = {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
        total_transactions: parseInt(summary.total_transactions) || 0
      };
      
      return success(res, reportData, 'Ringkasan laporan berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get breakdown by category
   */
  getByCategory: async (req, res, next) => {
    try {
      const { start_date, end_date, period, type } = req.query;
      
      let dateFilter = '';
      const params = [req.user.id];
      
      if (period) {
        const { start, end } = getDateRange(period);
        dateFilter = ' AND t.date >= ? AND t.date <= ?';
        params.push(start, end);
      } else if (start_date && end_date) {
        dateFilter = ' AND t.date >= ? AND t.date <= ?';
        params.push(start_date, end_date);
      }
      
      let typeFilter = '';
      if (type) {
        typeFilter = ' AND t.type = ?';
        params.push(type);
      }
      
      const categoryBreakdown = await query(
        `SELECT 
          c.id,
          c.name,
          c.icon,
          c.color,
          t.type,
          SUM(t.amount) as total,
          COUNT(*) as count
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = ?${dateFilter}${typeFilter}
         GROUP BY c.id, c.name, c.icon, c.color, t.type
         ORDER BY total DESC`,
        params
      );
      
      const formattedData = categoryBreakdown.map(item => ({
        category_id: item.id,
        category_name: item.name,
        category_icon: item.icon,
        category_color: item.color,
        type: item.type,
        total: parseFloat(item.total),
        count: parseInt(item.count)
      }));
      
      return success(res, formattedData, 'Laporan per kategori berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get breakdown by wallet
   */
  getByWallet: async (req, res, next) => {
    try {
      const { start_date, end_date, period } = req.query;
      
      let dateFilter = '';
      const params = [req.user.id];
      
      if (period) {
        const { start, end } = getDateRange(period);
        dateFilter = ' AND t.date >= ? AND t.date <= ?';
        params.push(start, end);
      } else if (start_date && end_date) {
        dateFilter = ' AND t.date >= ? AND t.date <= ?';
        params.push(start_date, end_date);
      }
      
      const walletBreakdown = await query(
        `SELECT 
          w.id,
          w.name,
          w.icon,
          w.color,
          w.balance as current_balance,
          SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
          SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
          COUNT(*) as transaction_count
         FROM wallets w
         LEFT JOIN transactions t ON w.id = t.wallet_id AND t.user_id = ?${dateFilter}
         WHERE w.user_id = ?
         GROUP BY w.id, w.name, w.icon, w.color, w.balance
         ORDER BY w.is_default DESC, w.name ASC`,
        [...params, req.user.id]
      );
      
      const formattedData = walletBreakdown.map(item => ({
        wallet_id: item.id,
        wallet_name: item.name,
        wallet_icon: item.icon,
        wallet_color: item.color,
        current_balance: parseFloat(item.current_balance),
        total_income: parseFloat(item.total_income) || 0,
        total_expense: parseFloat(item.total_expense) || 0,
        transaction_count: parseInt(item.transaction_count) || 0
      }));
      
      return success(res, formattedData, 'Laporan per dompet berhasil diambil');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get monthly trend
   */
  getMonthly: async (req, res, next) => {
    try {
      const { year } = req.query;
      const targetYear = year || new Date().getFullYear();
      
      const monthlyData = await query(
        `SELECT 
          MONTH(date) as month,
          YEAR(date) as year,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
          COUNT(*) as count
         FROM transactions
         WHERE user_id = ? AND YEAR(date) = ?
         GROUP BY YEAR(date), MONTH(date)
         ORDER BY MONTH(date) ASC`,
        [req.user.id, targetYear]
      );
      
      // Create array for all 12 months
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const formattedData = monthNames.map((name, index) => {
        const monthNum = index + 1;
        const monthData = monthlyData.find(m => m.month === monthNum);
        
        return {
          month: monthNum,
          month_name: name,
          year: targetYear,
          income: monthData ? parseFloat(monthData.income) : 0,
          expense: monthData ? parseFloat(monthData.expense) : 0,
          balance: monthData ? parseFloat(monthData.income) - parseFloat(monthData.expense) : 0,
          count: monthData ? parseInt(monthData.count) : 0
        };
      });
      
      return success(res, formattedData, 'Laporan trend bulanan berhasil diambil');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReportController;
