import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle2, AlertTriangle, Warehouse, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_OPTIONS = ['Feed', 'Medicine', 'Equipment', 'Consumables', 'Other'];
const COMMON_UNITS = ['kg', 'liters', 'units', 'vials', 'packs', 'bags', 'bales'];

const initialFormState = {
  itemName: '',
  category: 'Feed',
  quantity: 100,
  unit: 'kg',
  reorderLevel: 20,
  costPerUnit: 150,
  supplier: '',
  storageLocation: 'Main Store',
  expirationDate: '',
};

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await farmService.getInventory();
      if (res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Open modal for Adding an inventory item
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setModalMode('create');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Editing an inventory item
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName || '',
      category: item.category || 'Feed',
      quantity: item.quantity !== undefined ? item.quantity : 0,
      unit: item.unit || 'kg',
      reorderLevel: item.reorderLevel !== undefined ? item.reorderLevel : 10,
      costPerUnit: item.costPerUnit !== undefined ? item.costPerUnit : 0,
      supplier: item.supplier || '',
      storageLocation: item.storageLocation || 'Main Store',
      expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
    });
    setModalMode('edit');
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Deleting an inventory item
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'reorderLevel' || name === 'costPerUnit' ? Number(value) : value,
    }));
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (modalMode === 'create') {
        const res = await farmService.createInventoryItem(formData);
        if (res.success) {
          showNotification(`Item "${formData.itemName}" added to inventory successfully.`);
          setIsFormModalOpen(false);
          await fetchInventory();
        } else {
          setFormError(res.message || 'Failed to add inventory item');
        }
      } else {
        const targetId = selectedItem._id || selectedItem.id;
        const res = await farmService.updateInventoryItem(targetId, formData);
        if (res.success) {
          showNotification(`Inventory item "${formData.itemName}" updated successfully.`);
          setIsFormModalOpen(false);
          await fetchInventory();
        } else {
          setFormError(res.message || 'Failed to update inventory item');
        }
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving inventory item');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const targetId = itemToDelete._id || itemToDelete.id;
      const res = await farmService.deleteInventoryItem(targetId);
      if (res.success) {
        showNotification(`Item "${itemToDelete.itemName}" removed from inventory.`);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        await fetchInventory();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Filter items by search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      item.storageLocation?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate quick stats
  const totalValuation = items.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.costPerUnit || 0), 0);
  const lowStockCount = items.filter((i) => (i.quantity || 0) <= (i.reorderLevel || 0)).length;

  const columns = [
    {
      header: 'Item Name',
      field: 'itemName',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">{r.itemName}</div>
            <div className="text-[11px] text-slate-400">{r.storageLocation || 'Main Store'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      field: 'category',
      render: (r) => {
        const variant =
          r.category === 'Feed'
            ? 'success'
            : r.category === 'Medicine'
            ? 'danger'
            : r.category === 'Equipment'
            ? 'info'
            : 'default';
        return <Badge variant={variant}>{r.category}</Badge>;
      },
    },
    {
      header: 'Stock Level',
      field: 'quantity',
      render: (r) => {
        const isLow = (r.quantity || 0) <= (r.reorderLevel || 0);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
              {r.quantity} {r.unit}
            </span>
            {isLow && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" /> Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Reorder Point',
      field: 'reorderLevel',
      render: (r) => (
        <span className="text-slate-400 font-mono text-xs">
          {r.reorderLevel} {r.unit}
        </span>
      ),
    },
    {
      header: 'Cost / Unit',
      field: 'costPerUnit',
      render: (r) => (
        <span className="font-mono text-slate-200">
          {formatCurrency(r.costPerUnit || 0)}
        </span>
      ),
    },
    {
      header: 'Total Value',
      field: 'totalValue',
      render: (r) => (
        <span className="font-mono font-medium text-emerald-400">
          {formatCurrency((r.quantity || 0) * (r.costPerUnit || 0))}
        </span>
      ),
    },
    {
      header: 'Supplier',
      field: 'supplier',
      render: (r) => <span className="text-slate-300">{r.supplier || '—'}</span>,
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all"
            title="Edit Item Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            title="Delete Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventory & Supply Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Feed stock, veterinary medications, consumables, and supplier reordering
          </p>
        </div>
        {/* Linked Green Button */}
        <Button icon={Plus} onClick={handleOpenAdd} className="shadow-lg shadow-emerald-900/40">
          Add Inventory Item
        </Button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Inventory Items</div>
            <div className="text-2xl font-bold text-white mt-1">{items.length} SKUs</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Low Stock Warnings</div>
            <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowStockCount} Items
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${lowStockCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Stock Valuation</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(totalValuation)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 shadow-inner">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search items by name, supplier, or storage location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none w-full text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', ...CATEGORY_OPTIONS].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Fetching inventory records..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyText="No inventory items found matching your filters."
        />
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT INVENTORY ITEM MODAL                                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={modalMode === 'create' ? 'Add Inventory Item' : `Edit Item: ${formData.itemName}`}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Item Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Alfalfa Hay High-Protein"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
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
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Measurement Unit <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. kg, liters, vials, packs"
                list="units-list"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <datalist id="units-list">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Stock Quantity <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reorder Alert Level <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="Threshold for low-stock warning"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Cost Per Unit */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cost Per Unit (LKR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                placeholder="Price per unit"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Storage Location</label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="e.g. Silo 2, Vet Cabinet A"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Supplier Name</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g. AgriFeed Co., LankaPharma"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Expiration Date (Optional)</label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              disabled={formSubmitting}
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting
                ? 'Saving...'
                : modalMode === 'create'
                ? 'Add Inventory Item'
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
        title="Confirm Item Removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove item{' '}
            <strong className="text-white font-medium">{itemToDelete?.itemName}</strong> from inventory?
          </p>
          <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            ⚠ Warning: This will permanently delete this inventory record and its stock tracking.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {deleting ? 'Removing...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;
