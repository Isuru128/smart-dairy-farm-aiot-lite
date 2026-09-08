import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Activity, Cpu, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import loginBg from '../../assets/login-bg.jpg';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Unable to reach backend server. Please verify the backend is running and VITE_API_BASE_URL is correct.');
      } else {
        setError(err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 overflow-hidden">
      {/* LEFT SIDE: Scenic Farm Image with Overlay & Highlights */}
      <div className="relative hidden lg:flex lg:w-3/5 xl:w-2/3 flex-col justify-between p-12 overflow-hidden bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${loginBg})` }}
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#fbf0e8] border border-amber-200/40 shadow-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logo} alt="NexaDairy (pvt) Ltd. Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              NexaDairy (pvt) Ltd.
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                AIoT Smart Farm
              </span>
            </h1>
            <p className="text-xs text-slate-300">Precision Livestock Management & Automation</p>
          </div>
        </div>

        {/* Bottom Feature Highlights */}
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            NexaDairy Intelligence & Automation System
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Precision Livestock Management for NexaDairy Farms
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time RFID cattle tracking, automated milking sensors, scheduled pasture gates, and predictive health analytics.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Telemetry</span>
              </div>
              <p className="text-sm font-semibold text-white">Live Barn IoT</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Automated</span>
              </div>
              <p className="text-sm font-semibold text-white">Smart Gates</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Security</span>
              </div>
              <p className="text-sm font-semibold text-white">RBAC Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Admin Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-slate-950">
        {/* Background ambient glow */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Sign In</h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Enter your authorized credentials to access the NexaDairy operations console
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-semibold tracking-wide"
              icon={ArrowRight}
            >
              {loading ? 'Verifying Session...' : 'Authenticate & Enter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
