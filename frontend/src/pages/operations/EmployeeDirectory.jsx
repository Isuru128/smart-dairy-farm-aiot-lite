import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Plus } from 'lucide-react';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmService.getEmployees()
      .then((res) => {
        if (res.data) setEmployees(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Name', field: 'name', render: (r) => <span className="font-semibold text-white">{r.name}</span> },
    { header: 'Phone', field: 'phone' },
    { header: 'Role', field: 'role', render: (r) => <Badge variant="purple">{r.role}</Badge> },
    { header: 'Shift', field: 'shift' },
    {
      header: 'Status',
      field: 'status',
      render: (r) => <Badge variant={r.status === 'Active' ? 'success' : 'warning'}>{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Staff & Operations Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Farm operators, veterinarians, shift rosters, and task scheduling</p>
        </div>
        <Button icon={Plus}>Add Staff Member</Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading staff records..." />
      ) : (
        <DataTable columns={columns} data={employees} />
      )}
    </div>
  );
};

export default EmployeeDirectory;
