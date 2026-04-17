import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { runWhatIf } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { TrendingUp, TrendingDown, Zap, Send } from "lucide-react";

const PRESETS = [
  { icon: "🚬", label: "Start smoking", risk: true },
  { icon: "🍺", label: "Drink alcohol daily", risk: true },
  { icon: "🛌", label: "Sleep only 4 hrs/day", risk: true },
  { icon: "🏃", label: "Exercise 5× per week", risk: false },
  { icon: "🍔", label: "Eat junk food daily", risk: true },
  { icon: "🧘", label: "Meditate daily", risk: false },
  { icon: "💊", label: "Stop taking medicines", risk: true },
  { icon: "🥗", label: "Eat healthy daily", risk: false },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-sky-100 rounded-2xl p-3 shadow-xl">
        <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-extrabold gradient-text">{payload[0].value}</p>
        <p className="text-xs text-gray-400">Health Score</p>
      </div>
    );
  }
  return null;
};

export default function WhatIf() {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (s) => {
    const text = s || scenario;
    if (!text.trim()) { toast.error("Enter a scenario first"); return; }
    setLoading(true);
    try {
      const res = await runWhatIf(text);
      if (res.success) { setResult(res.data); toast.success("Simulation complete! 🔮"); }
    } catch (err) { toast.error(err.response?.data?.error || "Simulation failed"); }
    finally { setLoading(false); }
  };

  const getChartData = () => {
    if (!result?.impact) return [];
    const base = 75;
    const oy = result.impact.oneYear?.healthScoreChange || 0;
    const fy = result.impact.fiveYear?.healthScoreChange || 0;
    const ty = result.impact.tenYear?.healthScoreChange || 0;
    return [
      { year: "Now", score: base },
      { year: "1 Year", score: Math.max(0, Math.min(100, base + oy)) },
      { year: "5 Years", score: Math.max(0, Math.min(100, base + fy)) },
      { year: "10 Years", score: Math.max(0, Math.min(100, base + ty)) },
    ];
  };

  const renderTimeframe = (data, label, emoji, delay) => {
    if (!data) return null;
    const isPositive = data.healthScoreChange > 0;
    const isNegative = data.healthScoreChange < 0;
    return (
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${delay}s`, opacity: 0, animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{emoji}</span>
          <h3 className="text-sm font-bold text-gray-700">{label}</h3>
        </div>
        {data.healthScoreChange !== undefined && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-3 ${
            isPositive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
            isNegative ? "bg-red-50 text-red-500 border border-red-100" :
            "bg-gray-50 text-gray-500 border border-gray-100"
          }`}>
            {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : null}
            {data.healthScoreChange > 0 ? "+" : ""}{data.healthScoreChange} pts
          </div>
        )}
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{data.summary}</p>
        {data.worseningConditions?.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-bold text-red-400">⚠️ Worsening:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.worseningConditions.map((c, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-400 border border-red-100">{c}</span>
              ))}
            </div>
          </div>
        )}
        {data.newRisks?.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-bold text-amber-500">🆕 New Risks:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.newRisks.map((r, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100">{r}</span>
              ))}
            </div>
          </div>
        )}
        {data.improvements?.length > 0 && (
          <div>
            <span className="text-xs font-bold text-emerald-500">✅ Improvements:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.improvements.map((m, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <LoadingOverlay visible={loading} message="🔮 Running What-If simulation across 1, 5, and 10 year timelines..." />

      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(56,189,248,0.06))" }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-2xl shadow-lg animate-float">🔮</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">What-If Scenario Analyzer</h1>
            <p className="text-sm text-gray-400">Simulate how lifestyle changes affect your long-term health</p>
          </div>
        </div>

        {/* Preset Scenarios */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <Zap size={13} className="text-sky-400" /> Quick Scenarios
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => { setScenario(p.label); handleAnalyze(p.label); }}
                className={`glass-card p-4 text-center hover:-translate-y-1.5 group cursor-pointer ${p.risk ? "hover:border-red-200" : "hover:border-emerald-200"}`}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{p.icon}</div>
                <div className="text-xs font-semibold text-gray-600 leading-tight">{p.label}</div>
                <div className={`text-xs mt-1 font-bold ${p.risk ? "text-red-400" : "text-emerald-500"}`}>
                  {p.risk ? "↑ Risk" : "↑ Health"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Scenario */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1.5">✏️ Custom Scenario</h3>
          <div className="flex gap-3">
            <input
              className="input-field flex-1 text-sm"
              placeholder="e.g., 'Start swimming 3× per week and quit sugar...'"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button onClick={() => handleAnalyze()} className="btn-primary px-5 rounded-2xl flex items-center gap-2 text-sm flex-shrink-0" disabled={loading}>
              <Send size={14} /> Analyze
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔮</span>
              <h2 className="text-base font-bold text-gray-700">
                Results: "<span className="gradient-text font-extrabold">{result.scenario}</span>"
              </h2>
            </div>

            {/* Timeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderTimeframe(result.impact?.oneYear, "1 Year", "📅", 0)}
              {renderTimeframe(result.impact?.fiveYear, "5 Years", "📆", 0.12)}
              {renderTimeframe(result.impact?.tenYear, "10 Years", "🗓️", 0.24)}
            </div>

            {/* Projected Chart */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-gray-600 mb-5">📈 Projected Health Score Trajectory</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                    <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="#e0f2fe" strokeDasharray="5 3" />
                    <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={3}
                      dot={{ fill: "white", stroke: "#38bdf8", strokeWidth: 2.5, r: 6 }}
                      activeDot={{ r: 8, fill: "#38bdf8", stroke: "white", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Dashed line = current baseline (75)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
