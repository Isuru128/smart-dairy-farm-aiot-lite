const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

export const USER_ROLES = {
  ADMIN: 'Admin',
  FARM_MANAGER: 'farm-manager',
  VETERINARIAN: 'veterinarian',
  EMPLOYEE: 'employee',
  FINANCIAL_OFFICER: 'financial-officer',
};

export const NAVIGATION_LINKS = [
  { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { name: 'Livestock', path: '/livestock', icon: 'Beef' },
  { name: 'Milk Yield', path: '/milk-production', icon: 'Milk' },
  { name: 'IoT Sensors', path: '/iot-sensors', icon: 'Cpu' },
  { name: 'Smart Feeding', path: '/feeding-grazing', icon: 'Utensils' },
  { name: 'AI Forecasts', path: '/ai-predictions', icon: 'BrainCircuit' },
  { name: 'Inventory', path: '/inventory', icon: 'Package' },
  { name: 'Operations', path: '/operations', icon: 'Users' },
  { name: 'Finances', path: '/finance', icon: 'DollarSign' },
  { name: 'Alerts', path: '/alerts', icon: 'Bell' },
  { name: 'Settings', path: '/settings', icon: 'Settings' },
];
