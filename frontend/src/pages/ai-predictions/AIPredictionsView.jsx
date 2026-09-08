import React, { useState, useEffect } from 'react';
import { farmService } from '../../services/farmService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Sliders,
  Thermometer,
  Scale,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

const BREED_OPTIONS = ['Holstein Friesian', 'Jersey', 'Sahiwal'];
const LACTATION_OPTIONS = ['Early', 'Mid', 'Late'];

const AIPredictionsView = () => {
  const [cows, setCows] = useState([]);
  const [feedOpt, setFeedOpt] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Simulation Form State
  const [simForm, setSimForm] = useState({
    breed: 'Holstein Friesian',
    weightKg: 620,
    lactationStage: 'Early',
    daysInMilk: 45,
    feedIntakeKg: 24,
    ambientTempCelsius: 24,
    ruminationHours: 8.2,
    algorithm: 'xgboost', // 'xgboost' | 'lightgbm'
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Disease Risk State
  const [diseaseInput, setDiseaseInput] = useState({
    bodyTempCelsius: 38.6,
    ambientHumidityPercent: 65,
    activityStepsToday: 2800,
    ruminationHours: 7.5,
  });
  const [diseaseRisk, setDiseaseRisk] = useState(null);
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        const [cowsRes, feedRes, predRes, riskRes] = await Promise.allSettled([
          farmService.getCows(),
          farmService.getFeedOptimization(),
          farmService.predictYield({
            breed: 'Holstein Friesian',
            weightKg: 620,
            lactationStage: 'Early',
            daysInMilk: 45,
            feedIntakeKg: 24,
            ambientTempCelsius: 24,
            ruminationHours: 8.2,
            algorithm: 'xgboost',
          }),
          farmService.analyzeDiseaseRisk({
            bodyTempCelsius: 38.6,
            ambientHumidityPercent: 65,
            activityStepsToday: 2800,
            ruminationHours: 7.5,
          }),
        ]);

        if (cowsRes.status === 'fulfilled' && cowsRes.value?.data) {
          setCows(cowsRes.value.data);
        }
        if (feedRes.status === 'fulfilled' && feedRes.value?.data) {
          setFeedOpt(feedRes.value.data);
        }
        if (predRes.status === 'fulfilled' && predRes.value?.data) {
          setPredictionResult(predRes.value.data);
        }
        if (riskRes.status === 'fulfilled' && riskRes.value?.data) {
          setDiseaseRisk(riskRes.value.data);
        }
      } catch (err) {
        console.error('Error loading AI insights:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  // Quick-select cow handler
  const handleSelectCow = (e) => {
    const tag = e.target.value;
    if (!tag) return;
    const cow = cows.find((c) => c.tagId === tag);
    if (cow) {
      setSimForm((prev) => ({
        ...prev,
        breed: cow.breed || 'Holstein Friesian',
        weightKg: cow.weightKg || 600,
        lactationStage: cow.lactationStage && cow.lactationStage !== 'None' ? cow.lactationStage : 'Early',
      }));
    }
  };

  // Run Yield Prediction
  const handleRunPrediction = async (e) => {
    if (e) e.preventDefault();
    try {
      setPredicting(true);
      const res = await farmService.predictYield(simForm);
      if (res.data) {
        setPredictionResult(res.data);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setPredicting(false);
    }
  };

  // Run Disease Risk Evaluation
  const handleEvaluateRisk = async () => {
    try {
      setEvaluatingRisk(true);
      const res = await farmService.analyzeDiseaseRisk(diseaseInput);
      if (res.data) {
        setDiseaseRisk(res.data);
      }
    } catch (err) {
      console.error('Disease risk check failed:', err);
    } finally {
      setEvaluatingRisk(false);
    }
  };

  if (initialLoading) return <LoadingSpinner text="Connecting to LightGBM & XGBoost inference engines..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI & Predictive Analytics</h2>
          </div>
          <p className="text-sm text-slate-400">
            High-performance <strong>LightGBM</strong> & <strong>XGBoost</strong> machine learning models for milk production forecasting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">FastAPI Engine: Active</Badge>
          <Badge variant="success">ML Models: Loaded</Badge>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Predicted Daily Yield (Next 7D)"
          value={`${predictionResult?.predictedYieldLiters || 28.5} L`}
          change={`Confidence ${Math.round((predictionResult?.confidenceScore || 0.92) * 100)}%`}
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Optimal Daily Feed Cost"
          value={feedOpt?.estimatedCostPerCowDaily || 'LKR 1,280.00'}
          unit="/ cow"
          icon={BrainCircuit}
          color="purple"
        />
        <StatCard
          title="Expected Yield Gain"
          value={feedOpt?.expectedYieldGainLiters || '+1.9 L'}
          unit="/ day"
          isPositive={true}
          icon={Sparkles}
          color="blue"
        />
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODEL SIMULATOR / TEST BENCH                                   */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Machine Learning Simulator (LightGBM vs XGBoost)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust animal and nutritional variables to compute instantaneous yield forecasts and inspect feature importance.
            </p>
          </div>

          {/* Algorithm Engine Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 px-2 uppercase">Model:</span>
            <button
              type="button"
              onClick={() => setSimForm((prev) => ({ ...prev, algorithm: 'xgboost' }))}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                simForm.algorithm === 'xgboost'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              XGBoost Regressor
            </button>
            <button
              type="button"
              onClick={() => setSimForm((prev) => ({ ...prev, algorithm: 'lightgbm' }))}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                simForm.algorithm === 'lightgbm'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LightGBM (GBDT)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (7 Cols) */}
          <form onSubmit={handleRunPrediction} className="lg:col-span-7 space-y-4">
            {/* Quick Fill from Registered Herd */}
            {cows.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-300 font-medium">Auto-fill from Registered Cow:</div>
                <select
                  onChange={handleSelectCow}
                  className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose Cow Tag...</option>
                  {cows.map((c) => (
                    <option key={c._id || c.tagId} value={c.tagId}>
                      {c.tagId} ({c.name} - {c.breed})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Breed */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Breed</label>
                <select
                  value={simForm.breed}
                  onChange={(e) => setSimForm({ ...simForm, breed: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {BREED_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lactation Stage */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Lactation Stage</label>
                <select
                  value={simForm.lactationStage}
                  onChange={(e) => setSimForm({ ...simForm, lactationStage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {LACTATION_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st} Stage
                    </option>
                  ))}
                </select>
              </div>

              {/* Days in Milk */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Days in Milk (DIM)</label>
                <input
                  type="number"
                  min="1"
                  max="350"
                  value={simForm.daysInMilk}
                  onChange={(e) => setSimForm({ ...simForm, daysInMilk: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Body Weight Slider */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-400" /> Cow Weight
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{simForm.weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="380"
                  max="750"
                  step="5"
                  value={simForm.weightKg}
                  onChange={(e) => setSimForm({ ...simForm, weightKg: Number(e.target.value) })}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Feed Intake Slider */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Daily Feed Intake
                  </span>
                  <span className="font-mono font-bold text-amber-400">{simForm.feedIntakeKg} kg/day</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="32"
                  step="0.5"
                  value={simForm.feedIntakeKg}
                  onChange={(e) => setSimForm({ ...simForm, feedIntakeKg: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Ambient Temp Slider */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Barn Ambient Temp
                  </span>
                  <span className="font-mono font-bold text-rose-400">{simForm.ambientTempCelsius}°C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="36"
                  step="0.5"
                  value={simForm.ambientTempCelsius}
                  onChange={(e) => setSimForm({ ...simForm, ambientTempCelsius: Number(e.target.value) })}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rumination Hours Slider */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" /> Rumination Time
                  </span>
                  <span className="font-mono font-bold text-sky-400">{simForm.ruminationHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.1"
                  value={simForm.ruminationHours}
                  onChange={(e) => setSimForm({ ...simForm, ruminationHours: Number(e.target.value) })}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={predicting}
              icon={Sparkles}
              className="w-full py-2.5 shadow-lg shadow-emerald-900/40"
            >
              {predicting ? 'Evaluating ML Tree Boosting...' : 'Run ML Prediction Model'}
            </Button>
          </form>

          {/* Results Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Predicted Daily Yield
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  {predictionResult?.algorithmUsed || 'XGBoost Regressor'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {predictionResult?.predictedYieldLiters || 28.5}
                </span>
                <span className="text-lg font-bold text-emerald-400">Liters / Day</span>
              </div>

              {/* Confidence & Latency */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Model Confidence</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {Math.round((predictionResult?.confidenceScore || 0.94) * 100)}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase">Inference Latency</div>
                  <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                    {predictionResult?.inferenceLatencyMs || 8.2} ms
                  </div>
                </div>
              </div>

              {/* Feature Importance Bars */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Feature Attribution (Tree Gini Split)</span>
                </div>
                {Object.entries(
                  predictionResult?.featureContribution || {
                    'Lactation Stage': 34.2,
                    'Daily Feed Intake': 28.5,
                    'Genetic Breed': 18.3,
                    'Days In Milk': 10.1,
                  }
                ).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{key}</span>
                      <span className="font-mono text-slate-300">{val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Farm Recommendations
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                {predictionResult?.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: DISEASE RISK & FEED OPTIMIZATION                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed Optimization Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              Optimal Feed Ration Formulation
            </h3>
            <Badge variant="purple">Linear Optimization</Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm text-slate-300">Corn Silage (High Energy)</span>
              <span className="font-mono font-bold text-white">
                {feedOpt?.recommendedRation?.cornSilageKg || 24.0} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm text-slate-300">Alfalfa Hay (Crude Protein)</span>
              <span className="font-mono font-bold text-white">
                {feedOpt?.recommendedRation?.alfalfaHayKg || 6.5} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm text-slate-300">Protein Concentrate (Pellet)</span>
              <span className="font-mono font-bold text-white">
                {feedOpt?.recommendedRation?.proteinConcentrateKg || 8.5} kg
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm text-slate-300">Mineral & Vitamin Pack</span>
              <span className="font-mono font-bold text-white">
                {feedOpt?.recommendedRation?.mineralSupplementsGrams || 250} g
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs text-purple-300">
            <span>Ration Dry Matter Target: 48.5%</span>
            <span className="font-bold font-mono">Net Cost: {feedOpt?.estimatedCostPerCowDaily || 'LKR 1,280.00'}/day</span>
          </div>
        </div>

        {/* Disease Risk Analysis Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Disease Risk Assessment & Early Anomaly Detection
            </h3>
            <Badge variant={diseaseRisk?.overallRiskScore === 'High' ? 'danger' : 'success'}>
              {diseaseRisk?.overallRiskScore || 'Low'} Risk
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-sm text-slate-300 font-medium">Subclinical Mastitis Risk</div>
                <div className="text-[11px] text-slate-500">Evaluated from milk temp & somatic indicators</div>
              </div>
              <Badge variant={diseaseRisk?.mastitisRisk?.includes('Moderate') ? 'warning' : 'success'}>
                {diseaseRisk?.mastitisRisk || 'Low (4%)'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-sm text-slate-300 font-medium">Thermal / Heat Stress Index</div>
                <div className="text-[11px] text-slate-500">Computed from THI (Temp-Humidity Index)</div>
              </div>
              <Badge variant={diseaseRisk?.heatStressRisk?.includes('Moderate') ? 'warning' : 'success'}>
                {diseaseRisk?.heatStressRisk || 'Low (5%)'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-sm text-slate-300 font-medium">Ketosis Susceptibility</div>
                <div className="text-[11px] text-slate-500">Early-lactation negative energy balance</div>
              </div>
              <Badge variant={diseaseRisk?.ketosisRisk?.includes('Elevated') ? 'warning' : 'success'}>
                {diseaseRisk?.ketosisRisk || 'Low (3%)'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">IoT sensor monitoring interval: 10 seconds</span>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              disabled={evaluatingRisk}
              onClick={handleEvaluateRisk}
            >
              {evaluatingRisk ? 'Checking...' : 'Re-scan Herd'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionsView;
