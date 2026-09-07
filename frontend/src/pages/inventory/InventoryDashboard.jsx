import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmService.getInventory()
      .then((res) => {
        if (res.data) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Item Name', field: 'itemName', render: (r) => <span className="font-semibold text-white">{r.itemName}</span> },
    { header: 'Category', field: 'category', render: (r) => <Badge variant="info">{r.category}</Badge> },
    { header: 'Stock Level', field: 'quantity', render: (r) => <span className="font-mono">{r.quantity} {r.unit}</span> },
    { header: 'Reorder Level', field: 'reorderLevel', render: (r) => `${r.reorderLevel} ${r.unit}` },
    { header: 'Cost / Unit', field: 'costPerUnit', render: (r) => formatCurrency(r.costPerUnit) },
    { header: 'Supplier', field: 'supplier' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventory & Supply Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Feed stock, veterinary medications, equipment, and supplier reordering</p>
        </div>
        <Button icon={Plus}>Add Inventory Item</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching inventory..." />
      ) : (
        <DataTable columns={columns} data={items} />
      )}
    </div>
  );
};

export default InventoryDashboard;
