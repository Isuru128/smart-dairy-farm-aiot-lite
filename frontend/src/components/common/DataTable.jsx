import React from 'react';

const DataTable = ({ columns, data, keyField = '_id', emptyText = 'No records found' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-5 py-3.5 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-5 py-3.5 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
