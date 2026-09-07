import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BrainCircuit, Sparkles, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AIPredictionsView = () => {
  const [prediction, setPrediction] = useState(null);
  const [feedOpt, setFeedOpt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      farmService.predictYield({ breed: 'Holstein Friesian', lactationStage: 'Early', feedIntakeKg: 22 }),
      farmService.getFeedOptimization(),
    ])
      .then(([predRes, feedRes]) => {
        if (predRes.data) setPrediction(predRes.data);
        if (feedRes.data) setFeedOpt(feedRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Running AI neural forecast models..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI & Predictive Analytics</h2>
          </div>
          <p className="text-sm text-slate-400">FastAPI ML models for milk production forecasting and feed ration optimization</p>
        </div>
        <Badge variant="purple">AI Engine: Online</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Predicted Herd Yield (Next 7D)"
          value={`${prediction?.predictedYieldLiters || 27.8} L`}
          change="AI Confidence 92%"
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Optimal Daily Feed Cost"
          value={feedOpt?.estimatedCostPerCowDaily || 'LKR 1,250.00'}
          unit="/ cow"
          icon={BrainCircuit}
          color="purple"
        />
        <StatCard
          title="Expected Yield Gain"
          value={feedOpt?.expectedYieldGainLiters || '+1.8 L'}
          unit="/ day"
          isPositive={true}
          icon={Sparkles}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            AI Feeding Recommendations
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-300">
            {prediction?.recommendations?.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Disease Risk Analysis
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300">Mastitis Risk Index</span>
              <Badge variant="success">Low (5%)</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300">Heat Stress Risk</span>
              <Badge variant="warning">Moderate (12%)</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300">Ketosis Susceptibility</span>
              <Badge variant="success">Low (4%)</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionsView;
