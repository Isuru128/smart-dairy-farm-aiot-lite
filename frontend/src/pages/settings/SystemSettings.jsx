import React from 'react';
import Button from '../../components/common/Button';
import { Save, Server, Shield, Wifi } from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Farm & System Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Configure hardware gateways, AI thresholds, and farm parameters</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
            <Wifi className="w-4 h-4 text-emerald-400" />
            IoT Gateway & MQTT Broker Configuration
          </h3>
          <p className="text-xs text-slate-400 mb-4">Endpoints connecting ESP32 & Raspberry Pi node collectors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">MQTT Broker URI</label>
              <input
                type="text"
                defaultValue="mqtt://broker.hivemq.com:1883"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Sensor Polling Interval (Sec)</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-purple-400" />
            AI Service & Microservices Endpoint
          </h3>
          <p className="text-xs text-slate-400 mb-4">FastAPI Python backend integration URL</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">AI API Host</label>
              <input
                type="text"
                defaultValue="http://localhost:8000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button icon={Save}>Save System Configuration</Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
