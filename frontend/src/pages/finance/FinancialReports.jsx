import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import StatCard from '../../components/common/StatCard';
import FinancialBarChart from '../../components/charts/FinancialBarChart';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Tag,
  FileText,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const INCOME_CATEGORIES = [
  'Milk Sales',
  'Cattle Sales',
  'Government Subsidy',
  'Manure & Byproducts',
  'Other',
];

const EXPENSE_CATEGORIES = [
  'Feed Purchase',
  'Veterinary & Meds',
  'Equipment & Utilities',
  'Salaries',
  'Maintenance',
  'Transportation',
  'Other',
];

const initialFormState = {
  type: 'income',
  category: 'Milk Sales',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  referenceInvoice: '',
};

const FinancialReports = () => {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTx, setSelectedTx] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const res = await farmService.getFinancials();
      if (res.data) {
        setFinance(res.data);
        setTransactions(res.data.recentTransactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Open modal for Adding a new transaction
  const handleOpenAdd = (defaultType = 'income') => {
    setFormData({
      ...initialFormState,
      type: defaultType,
      category: defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Editing an existing transaction
  const handleOpenEdit = (tx) => {
    setSelectedTx(tx);
    const txType = tx.type?.toLowerCase() === 'expense' ? 'expense' : 'income';
    setFormData({
      type: txType,
      category: tx.category || (txType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
      amount: tx.amount !== undefined ? tx.amount : '',
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: tx.description || '',
      referenceInvoice: tx.referenceInvoice || '',
    });
    setModalMode('edit');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDelete = (tx) => {
    setTxToDelete(tx);
    setIsDeleteModalOpen(true);
  };

  // Form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Switch between Income and Expense type in form
  const handleTypeSelect = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  // Form Submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please enter a description for this transaction');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        description: formData.description.trim(),
        referenceInvoice: formData.referenceInvoice.trim() || undefined,
      };

      if (modalMode === 'create') {
        const res = await farmService.createTransaction(payload);
        const newRecord = res.data || {
          _id: `tx-${Date.now()}`,
          ...payload,
          createdAt: new Date(),
        };

        // Update local transactions list
        setTransactions((prev) => [newRecord, ...prev]);

        // Dynamically update finance stats
        setFinance((prev) => {
          const rev = (prev?.totalRevenueMonth || 0) + (newRecord.type === 'income' ? newRecord.amount : 0);
          const exp = (prev?.totalExpensesMonth || 0) + (newRecord.type === 'expense' ? newRecord.amount : 0);
          return {
            ...prev,
            totalRevenueMonth: rev,
            totalExpensesMonth: exp,
            netProfitMonth: rev - exp,
            recentTransactions: [newRecord, ...(prev?.recentTransactions || [])],
          };
        });

        showNotification(
          `${newRecord.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(newRecord.amount)} recorded.`
        );
      } else {
        const txId = selectedTx._id;
        const res = await farmService.updateTransaction(txId, payload);
        const updatedRecord = res.data || {
          ...selectedTx,
          ...payload,
        };

        setTransactions((prev) =>
          prev.map((t) => (t._id === txId ? updatedRecord : t))
        );

        // Recompute aggregates
        fetchFinancials();
        showNotification(`Transaction updated successfully.`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setFormError(err.response?.data?.message || err.message || 'Error recording transaction');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    try {
      setDeleting(true);
      await farmService.deleteTransaction(txToDelete._id);
      setTransactions((prev) => prev.filter((t) => t._id !== txToDelete._id));

      // Recompute stats
      setFinance((prev) => {
        const rev = (prev?.totalRevenueMonth || 0) - (txToDelete.type === 'income' ? txToDelete.amount : 0);
        const exp = (prev?.totalExpensesMonth || 0) - (txToDelete.type === 'expense' ? txToDelete.amount : 0);
        return {
          ...prev,
          totalRevenueMonth: Math.max(0, rev),
          totalExpensesMonth: Math.max(0, exp),
          netProfitMonth: rev - exp,
        };
      });

      showNotification('Transaction removed successfully.');
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.referenceInvoice?.toLowerCase().includes(q);

    const matchesType = typeFilter === 'All' || t.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Dynamic totals from transactions
  const totalIncomeCalc = transactions
    .filter((t) => t.type?.toLowerCase() === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenseCalc = transactions
    .filter((t) => t.type?.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netProfitCalc = totalIncomeCalc - totalExpenseCalc;
  const profitMargin = totalIncomeCalc > 0 ? ((netProfitCalc / totalIncomeCalc) * 100).toFixed(1) : 0;

  // Available category options in form based on selected type
  const activeCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Data table columns
  const columns = [
    {
      header: 'Type',
      field: 'type',
      render: (r) => {
        const isIncome = r.type?.toLowerCase() === 'income';
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`p-1 rounded-lg ${
                isIncome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            </span>
            <Badge variant={isIncome ? 'success' : 'danger'}>
              {r.type?.toUpperCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Category',
      field: 'category',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <Tag className="w-3 h-3 text-slate-400" />
          {r.category}
        </span>
      ),
    },
    {
      header: 'Description & Reference',
      field: 'description',
      render: (r) => (
        <div>
          <div className="text-white font-medium text-sm">{r.description}</div>
          {r.referenceInvoice && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
              <FileText className="w-3 h-3 text-slate-500" />
              Ref: {r.referenceInvoice}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Amount',
      field: 'amount',
      render: (r) => {
        const isIncome = r.type?.toLowerCase() === 'income';
        return (
          <div className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(r.amount)}
          </div>
        );
      },
    },
    {
      header: 'Date',
      field: 'date',
      render: (r) => (
        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
          <Calendar className="w-3 h-3 text-slate-500" />
          {formatDate(r.date)}
        </div>
      ),
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
            title="Edit Transaction"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            title="Delete Transaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner text="Compiling financial analytics..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial & Revenue Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Milk sales cashflows, feed expenses, medication overhead, and monthly profitability
          </p>
        </div>

        {/* Action Buttons to Add Transactions */}
        <div className="flex items-center gap-2.5">
          <Button
            icon={Plus}
            onClick={() => handleOpenAdd('income')}
            className="shadow-lg shadow-emerald-900/40"
          >
            Add Income
          </Button>
          <Button
            icon={Plus}
            variant="danger"
            onClick={() => handleOpenAdd('expense')}
            className="shadow-lg shadow-rose-900/30"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Primary Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Revenue"
          value={formatCurrency(finance?.totalRevenueMonth || totalIncomeCalc)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Operating Expenses"
          value={formatCurrency(finance?.totalExpensesMonth || totalExpenseCalc)}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          title="Net Cashflow Margin"
          value={formatCurrency(finance?.netProfitMonth !== undefined ? finance.netProfitMonth : netProfitCalc)}
          icon={DollarSign}
          color={netProfitCalc >= 0 ? 'emerald' : 'rose'}
        />
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Profit Margin</div>
            <div className="text-2xl font-bold text-white mt-1">{profitMargin}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{transactions.length} Total Entries</div>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cashflow Trends Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-white tracking-tight">Cashflow Trends</h3>
            <p className="text-xs text-slate-400">Monthly comparison between gross income and operating overhead</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Income
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Expenses
            </span>
          </div>
        </div>
        <FinancialBarChart />
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 shadow-inner">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by description, reference invoice, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none w-full text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Transaction Type Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 px-3 font-medium">Type:</span>
          {['All', 'Income', 'Expense'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                typeFilter === t
                  ? t === 'Income'
                    ? 'bg-emerald-600 text-white'
                    : t === 'Expense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white tracking-tight">Recent Financial Transactions</h3>
          <span className="text-xs text-slate-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredTransactions}
          emptyText="No transactions found matching your filter criteria."
        />
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT TRANSACTION MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={
          modalMode === 'create'
            ? `Record New ${formData.type === 'income' ? 'Income' : 'Expense'}`
            : 'Edit Financial Transaction'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Type Toggle Selector (Income vs Expense) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Transaction Flow Type <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeSelect('income')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold text-sm ${
                  formData.type === 'income'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Income / Inflow (+)
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('expense')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold text-sm ${
                  formData.type === 'expense'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-md shadow-rose-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Expense / Outflow (-)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transaction Amount (LKR) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                  Rs.
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category <span className="text-emerald-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {activeCategories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transaction Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Reference / Invoice */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Invoice / Reference Number (Optional)
              </label>
              <input
                type="text"
                name="referenceInvoice"
                value={formData.referenceInvoice}
                onChange={handleChange}
                placeholder="e.g. INV-2026-088, RCPT-451, PO-102"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transaction Description <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows="2"
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Bulk milk delivery payout from Dairy Valley Co-op, or 5 Tons Alfalfa Hay shipment"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              disabled={formSubmitting}
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={formData.type === 'expense' ? 'danger' : 'primary'}
              disabled={formSubmitting}
            >
              {formSubmitting
                ? 'Processing...'
                : modalMode === 'create'
                ? formData.type === 'income'
                  ? 'Record Income'
                  : 'Record Expense'
                : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleting && setIsDeleteModalOpen(false)}
        title="Confirm Transaction Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              Are you sure you want to delete this {txToDelete?.type} entry of{' '}
              <strong className="text-white">{formatCurrency(txToDelete?.amount)}</strong> (
              {txToDelete?.description})?
              This will update monthly revenue and expense totals immediately.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? 'Deleting...' : 'Delete Transaction'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialReports;
