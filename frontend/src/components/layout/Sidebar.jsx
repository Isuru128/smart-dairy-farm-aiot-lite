import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Milk,
  Cpu,
  Utensils,
  BrainCircuit,
  Package,
  Users,
  DollarSign,
  Bell,
  Settings,
  ShieldAlert,
} from 'lucide-react';

import logo from '../../assets/logo.png';

const iconMap = {
  '/': LayoutDashboard,
  '/livestock': ShieldAlert,
  '/milk-production': Milk,
  '/iot-sensors': Cpu,
  '/feeding-grazing': Utensils,
  '/ai-predictions': BrainCircuit,
  '/inventory': Package,
  '/operations': Users,
  '/finance': DollarSign,
  '/alerts': Bell,
  '/settings': Settings,
};

const navigation = [
  { name: 'Dashboard', path: '/' },
  { name: 'Livestock', path: '/livestock' },
  { name: 'Milk Yield', path: '/milk-production' },
  { name: 'IoT Sensors', path: '/iot-sensors' },
  { name: 'Smart Feeding', path: '/feeding-grazing' },
  { name: 'AI Forecasts', path: '/ai-predictions' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Operations', path: '/operations' },
  { name: 'Finances', path: '/finance' },
  { name: 'Alerts', path: '/alerts' },
  { name: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-[#fbf0e8] p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-md border border-amber-300/30">
          <img src={logo} alt="NexaDairy Logo" className="w-full h-full object-contain rounded-lg" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-white tracking-tight text-sm truncate">NexaDairy (pvt) Ltd.</h1>
          <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">AIoT Enterprise</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = iconMap[item.path] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Hardware Status Widget */}
      <div className="p-4 m-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">IoT Gateway</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="text-[11px] text-slate-500">ESP32 & sensors connected</p>
      </div>
    </aside>
  );
};

export default Sidebar;
