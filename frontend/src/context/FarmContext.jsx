import React, { createContext, useState, useEffect, useContext } from 'react';
import { farmService } from '../services/farmService';

const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalCows: 124,
    milkingCows: 98,
    todayYieldLiters: 842.5,
    activeAlertsCount: 3,
    barnTemp: '23.4°C',
    barnHumidity: '68%',
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [alertRes, telemetryRes] = await Promise.allSettled([
        farmService.getAlerts(),
        farmService.getLiveSensors(),
      ]);

      if (alertRes.status === 'fulfilled' && alertRes.value?.data) {
        setAlerts(alertRes.value.data);
      }
      if (telemetryRes.status === 'fulfilled' && telemetryRes.value?.data) {
        setStats((prev) => ({
          ...prev,
          barnTemp: `${telemetryRes.value.data.barnTemperature}°C`,
          barnHumidity: `${telemetryRes.value.data.barnHumidity}%`,
        }));
      }
    } catch (e) {
      console.error('Failed to load farm data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <FarmContext.Provider value={{ stats, alerts, loading, refreshData: fetchDashboardData }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarmData = () => useContext(FarmContext);
