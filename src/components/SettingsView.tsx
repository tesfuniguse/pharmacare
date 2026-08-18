import React, { useState } from 'react';
import {
  Settings,
  Building,
  Store,
  Users,
  ShieldCheck,
  Plus,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Organization, Branch, User } from '../types.ts';

interface SettingsViewProps {
  organization: Organization;
  branches: Branch[];
  allUsers: User[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organization,
  branches,
  allUsers,
}) => {
  const [orgForm, setOrgForm] = useState(organization);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Multi-Branch & Organization Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure enterprise healthcare network settings, branch hierarchy, tax rules, and user roles.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold animate-pulse">
            <CheckCircle2 className="h-4 w-4" />
            <span>Organization settings saved!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Details */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <Building className="h-4 w-4 text-blue-600" />
            <span>Enterprise Organization Information</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-medium">Healthcare Network Name</label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium">Pharmacy License Number</label>
                <input
                  type="text"
                  value={orgForm.licenseNumber}
                  onChange={(e) => setOrgForm({ ...orgForm, licenseNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium">Tax / VAT Registration #</label>
                <input
                  type="text"
                  value={orgForm.taxNumber}
                  onChange={(e) => setOrgForm({ ...orgForm, taxNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium">Base Currency</label>
                <input
                  type="text"
                  value={orgForm.currency}
                  onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="save-org-settings-button"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow-xs"
              >
                <Save className="h-4 w-4" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Multi-Tenant Architecture Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>SaaS Tenant Isolation</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 text-slate-800">
              <div className="font-bold flex items-center gap-1.5 text-blue-700">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Tenant Isolation: Strict Row-Level Security</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                All inventory batches, patient prescriptions, and financial transactions are strictly segregated by <code>organizationId</code> and scoped by <code>branchId</code>.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Active Branches:</span>
                <span className="font-bold text-slate-800">{branches.length} Stores</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Staff Accounts:</span>
                <span className="font-bold text-slate-800">{allUsers.length} Operators</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Prescription Auditing:</span>
                <span className="font-bold text-green-700">FEFO Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Branch Grid */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Multi-Branch Network Topology ({branches.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{b.name}</h3>
                </div>
                <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">
                  {b.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div>Address: {b.address}</div>
                <div>Phone: {b.phone}</div>
                <div>Email: {b.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
