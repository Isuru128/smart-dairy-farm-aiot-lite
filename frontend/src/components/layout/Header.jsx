import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFarmData } from '../../hooks/useFarmData';
import { Bell, User, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const Header = () => {
  const { user, logout } = useAuth();
  const { alerts, refreshData, loading } = useFarmData();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.isResolved).length;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Live Farm Mode
          </span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Alerts Pill */}
          <div className="relative">
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>

          {/* User Pill & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white">{user?.displayName || user?.username || 'Farm Admin'}</div>
                <div className="text-[10px] text-emerald-400 font-medium capitalize">{user?.role || 'Super Admin'}</div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Sign out of your session?</h4>
              <p className="text-xs text-slate-400 mt-1">
                You will need to enter your credentials again to access the farm dashboard and IoT control panels.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={handleConfirmLogout}
            >
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
