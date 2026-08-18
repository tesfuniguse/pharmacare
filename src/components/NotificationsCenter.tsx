import React from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Package,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { AppNotification } from '../types.ts';

interface NotificationsCenterProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  onDismiss,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>Store Alerts & Expiry Notification Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time warnings for low stock inventory, nearing expiry batches, and required compliance actions.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 rounded-xl border border-slate-200 bg-white shadow-xs">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600 opacity-80" />
            <p>All clear! No pending clinical alerts or inventory warnings.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 shadow-xs flex items-start justify-between gap-4 transition ${
                n.severity === 'CRITICAL'
                  ? 'border-red-200 bg-red-50/60 text-red-900'
                  : n.severity === 'WARNING'
                  ? 'border-amber-200 bg-amber-50/60 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg p-2 shrink-0 ${
                    n.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-600'
                      : n.severity === 'WARNING'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {n.type === 'EXPIRY' ? (
                    <Clock className="h-5 w-5" />
                  ) : n.type === 'LOW_STOCK' ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {n.createdAt.replace('T', ' ').substring(0, 16)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                  {n.link && (
                    <button
                      onClick={() => onNavigateTab(n.link as any)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <span>Take Action in {n.link}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Mark as Read"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
