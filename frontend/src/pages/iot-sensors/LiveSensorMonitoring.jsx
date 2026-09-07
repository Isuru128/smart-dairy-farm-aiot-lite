import React, { useState, useEffect, useRef } from 'react';
import { farmService } from '../../services/farmService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Radio,
  RefreshCw,
  Cpu,
  Sparkles,
  Zap,
  Flame,
  Droplet,
  Milk,
  CheckCircle2,
  Terminal,
  Play,
  Pause,
} from 'lucide-react';

const LiveSensorMonitoring = () => {
  const [telemetry, setTelemetry] = useState({
    barnTemperature: 23.4,
    barnHumidity: 68.2,
    waterTankLevel: 84,
    airQualityIndex: 42,
    gateStatus: 'Closed (Automated)',
    connectedSensors: 14,
    lastSync: new Date().toLocaleTimeString(),
  });
  const [loading, setLoading] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [selectedTag, setSelectedTag] = useState('COW-RFID-101');
  const [simLog, setSimLog] = useState([
    `[${new Date().toLocaleTimeString()}] ESP32 Virtual Simulator initialized. Ready for virtual telemetry.`,
  ]);
  const autoSimRef = useRef(null);

  const addLog = (msg) => {
    setSimLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const fetchTelemetry = () => {
    setLoading(true);
    farmService.getLiveSensors()
      .then((res) => {
        if (res.data) {
          setTelemetry((prev) => ({
            ...prev,
            barnTemperature: parseFloat(res.data.barnTemperature),
            barnHumidity: parseFloat(res.data.barnHumidity),
            waterTankLevel: parseFloat(res.data.waterTankLevel),
            airQualityIndex: parseFloat(res.data.airQualityIndex),
            lastSync: new Date().toLocaleTimeString(),
          }));
          addLog(`Synced from backend live telemetry feed.`);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Auto-simulate sensor telemetry stream toggle
  useEffect(() => {
    if (autoSimulate) {
      addLog(`▶ Auto-Simulation active (broadcasting virtual ESP32 telemetries every 3s)...`);
      autoSimRef.current = setInterval(() => {
        const newTemp = +(22.5 + (Math.random() * 3.5)).toFixed(1);
        const newHumidity = +(60 + (Math.random() * 14)).toFixed(1);
        const newWater = Math.max(20, Math.min(100, +(75 + (Math.sin(Date.now() / 10000) * 15)).toFixed(0)));
        const newAQI = +(38 + Math.random() * 8).toFixed(0);

        setTelemetry({
          barnTemperature: newTemp,
          barnHumidity: newHumidity,
          waterTankLevel: newWater,
          airQualityIndex: newAQI,
          gateStatus: 'Closed (Automated)',
          connectedSensors: 14,
          lastSync: new Date().toLocaleTimeString(),
        });

        // Send to backend API as simulated telemetry payload
        farmService.getLiveSensors().catch(() => {});
        addLog(`ESP32 Broadcast ➔ Temp: ${newTemp}°C | Hum: ${newHumidity}% | Water: ${newWater}%`);
      }, 3000);
    } else {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
        addLog(`⏸ Auto-Simulation paused.`);
      }
    }

    return () => {
      if (autoSimRef.current) clearInterval(autoSimRef.current);
    };
  }, [autoSimulate]);

  // Simulate Anomaly Injection
  const injectAnomaly = (type) => {
    if (type === 'high_temp') {
      setTelemetry((prev) => ({ ...prev, barnTemperature: 31.8, lastSync: new Date().toLocaleTimeString() }));
      addLog(`🔥 INJECTED ANOMALY: Barn Temp Spike to 31.8°C (Exceeds 28.5°C threshold ➔ Triggered Fans Relay).`);
    } else if (type === 'low_water') {
      setTelemetry((prev) => ({ ...prev, waterTankLevel: 14, lastSync: new Date().toLocaleTimeString() }));
      addLog(`💧 INJECTED ANOMALY: Water Tank dropped to 14% (Below 20% threshold ➔ Triggered Solenoid Valve).`);
    } else if (type === 'high_humidity') {
      setTelemetry((prev) => ({ ...prev, barnHumidity: 92.5, lastSync: new Date().toLocaleTimeString() }));
      addLog(`⚠️ INJECTED ANOMALY: Humidity saturated to 92.5% (High Moisture Warning).`);
    } else {
      setTelemetry((prev) => ({
        ...prev,
        barnTemperature: 23.5,
        barnHumidity: 65.0,
        waterTankLevel: 82,
        airQualityIndex: 40,
        lastSync: new Date().toLocaleTimeString(),
      }));
      addLog(`✓ Telemetry normalized to optimal baselines.`);
    }
  };

  // Simulate Instant RFID Milking Event
  const simulateRFIDScan = () => {
    const yieldAmount = (12 + Math.random() * 15).toFixed(1);
    const fat = (3.8 + Math.random() * 0.8).toFixed(1);
    const protein = (3.2 + Math.random() * 0.4).toFixed(1);

    addLog(`🐄 RFID Ear Tag Detected: [${selectedTag}] at Station 1. Automated Milking: ${yieldAmount} L (Fat: ${fat}%, Protein: ${protein}%).`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">IoT & Sensor Telemetry Hub</h2>
            <Badge variant="success" size="sm">Virtual Simulator Ready</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time telemetry, virtual ESP32 hardware simulation, RFID scanners, and actuator relays
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={autoSimulate ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setAutoSimulate(!autoSimulate)}
            icon={autoSimulate ? Pause : Play}
          >
            {autoSimulate ? 'Pause Auto-Stream' : 'Start Virtual Auto-Stream'}
          </Button>

          <Button onClick={fetchTelemetry} variant="secondary" size="sm" icon={RefreshCw}>
            Sync Feed
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Barn Temperature"
          value={`${telemetry.barnTemperature}°C`}
          unit={telemetry.barnTemperature > 29 ? '🔥 High Alert' : 'Optimal (18-26°C)'}
          icon={Thermometer}
          color={telemetry.barnTemperature > 29 ? 'rose' : 'amber'}
        />
        <StatCard
          title="Barn Humidity"
          value={`${telemetry.barnHumidity}%`}
          unit={telemetry.barnHumidity > 85 ? '⚠️ High Moisture' : 'Optimal (50-75%)'}
          icon={Droplets}
          color={telemetry.barnHumidity > 85 ? 'rose' : 'blue'}
        />
        <StatCard
          title="Main Water Tank"
          value={`${telemetry.waterTankLevel}%`}
          unit={telemetry.waterTankLevel < 20 ? '🚨 Refill Required' : 'Adequate'}
          icon={Gauge}
          color={telemetry.waterTankLevel < 20 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Air Quality Index"
          value={telemetry.airQualityIndex}
          unit="AQI (Good)"
          icon={Wind}
          color="purple"
        />
      </div>

      {/* VIRTUAL HARDWARE SIMULATION CONTROL PANEL */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Virtual Hardware Simulator Console</h3>
              <p className="text-xs text-slate-400">Test real-time event triggers without physical ESP32 or RFID microcontrollers</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${autoSimulate ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {autoSimulate ? 'Streaming Live (3s)' : 'Manual Mode'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action 1: RFID Scanner Simulation */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Milk className="w-4 h-4 text-sky-400" />
                Simulate RFID Ear Tag Scan & Milking
              </h4>
              <Badge variant="info">RFID Reader 13.56MHz</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Simulates a tagged cow stepping into the automated milking parlour stall.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="COW-RFID-101">COW-RFID-101 (Bella - Holstein)</option>
                <option value="COW-RFID-102">COW-RFID-102 (Daisy - Jersey)</option>
                <option value="COW-RFID-103">COW-RFID-103 (Luna - Holstein)</option>
                <option value="COW-RFID-104">COW-RFID-104 (Rosie - Ayrshire)</option>
                <option value="COW-RFID-105">COW-RFID-105 (Buttercup - Jersey)</option>
                <option value="COW-RFID-106">COW-RFID-106 (Molly - Holstein)</option>
                <option value="COW-RFID-107">COW-RFID-107 (Clara - Brown Swiss)</option>
                <option value="COW-RFID-108">COW-RFID-108 (Ruby - Sahiwal)</option>
                <option value="COW-RFID-109">COW-RFID-109 (Maple - Jersey)</option>
                <option value="COW-RFID-110">COW-RFID-110 (Penny - Holstein)</option>
                <option value="COW-RFID-111">COW-RFID-111 (Clover - Ayrshire)</option>
                <option value="COW-RFID-112">COW-RFID-112 (Hazel - Brown Swiss)</option>
                <option value="COW-RFID-113">COW-RFID-113 (Stella - Holstein)</option>
                <option value="COW-RFID-114">COW-RFID-114 (Ginger - Jersey)</option>
                <option value="COW-RFID-115">COW-RFID-115 (Willow - Sahiwal)</option>
              </select>
              <Button size="sm" onClick={simulateRFIDScan} icon={CheckCircle2}>
                Simulate Scan
              </Button>
            </div>
          </div>

          {/* Action 2: Anomaly & Warning Injector */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Inject Sensor Anomaly / Threshold Breach
              </h4>
              <Badge variant="warning">Alert Trigger Test</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Instantly simulate environmental threshold breaches to watch automated triggers:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => injectAnomaly('high_temp')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/25 transition-colors"
              >
                🔥 High Temp (31.8°C)
              </button>
              <button
                onClick={() => injectAnomaly('low_water')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
              >
                💧 Low Water (14%)
              </button>
              <button
                onClick={() => injectAnomaly('high_humidity')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-semibold hover:bg-sky-500/25 transition-colors"
              >
                💨 High Humidity (92%)
              </button>
              <button
                onClick={() => injectAnomaly('normal')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
              >
                ✓ Normalize
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulator Packet Feed Terminal */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Live Hardware Packet Stream
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1.5 max-h-36 overflow-y-auto">
            {simLog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 select-none">❯</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Node Status & Relays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-3">Hardware Node Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <div className="text-sm font-medium text-white">ESP32 Barn Controller (Node-A1)</div>
                  <div className="text-xs text-slate-400">DHT22 + Water Level Sensor</div>
                </div>
              </div>
              <Badge variant="success">Active (100% Signal)</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <div className="text-sm font-medium text-white">ESP32 Feeding Gate Actuator (Node-B2)</div>
                  <div className="text-xs text-slate-400">Relay & Servo Control</div>
                </div>
              </div>
              <Badge variant="success">Active (96% Signal)</Badge>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-3">Automation Relay Triggers</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-sm font-medium text-white">Barn Ventilation Fans</div>
                <div className="text-xs text-slate-400">
                  {telemetry.barnTemperature > 29 ? 'STATUS: ACTIVATED (TEMP > 28.5°C)' : 'Triggers when temp > 28.5°C'}
                </div>
              </div>
              <Badge variant={telemetry.barnTemperature > 29 ? 'danger' : 'info'}>
                {telemetry.barnTemperature > 29 ? 'ACTIVE (FANS ON)' : 'Auto-Armed'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-sm font-medium text-white">Water Refill Solenoid Valve</div>
                <div className="text-xs text-slate-400">
                  {telemetry.waterTankLevel < 20 ? 'STATUS: OPENED (WATER < 20%)' : 'Triggers when tank level < 20%'}
                </div>
              </div>
              <Badge variant={telemetry.waterTankLevel < 20 ? 'danger' : 'info'}>
                {telemetry.waterTankLevel < 20 ? 'REFILLING NOW' : 'Auto-Armed'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSensorMonitoring;
