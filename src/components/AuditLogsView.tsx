import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { AuditLog } from '../types.ts';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.details.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term);
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,User,Role,Action,Entity,EntityID,Details\n' +
      auditLogs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.entity}","${l.entityId}","${l.details.replace(/"/g, '""')}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PharmaCore_Security_Audit_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span>Immutable Compliance & Security Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographically timestamped ledger of every prescription dispensed, batch quarantined, price modified, and stock transferred.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="audit-log-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit details, actor, or entity..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="PROCESS_SALE">PROCESS_SALE</option>
            <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
            <option value="UPDATE_PRODUCT">UPDATE_PRODUCT</option>
            <option value="CREATE_PRESCRIPTION">CREATE_PRESCRIPTION</option>
            <option value="RECEIVE_PURCHASE_ORDER">RECEIVE_PURCHASE_ORDER</option>
            <option value="CUSTOMER_CREDIT_PAYMENT">CUSTOMER_CREDIT_PAYMENT</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Operator & Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Action Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                  {log.timestamp.replace('T', ' ').substring(0, 19)}
                </td>

                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{log.userName}</div>
                  <div className="text-[10px] text-blue-600 uppercase font-mono font-medium">{log.userRole}</div>
                </td>

                <td className="py-3 px-4">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                    {log.action}
                  </span>
                </td>

                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.entity}</td>

                <td className="py-3 px-4 text-slate-700 text-xs">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
