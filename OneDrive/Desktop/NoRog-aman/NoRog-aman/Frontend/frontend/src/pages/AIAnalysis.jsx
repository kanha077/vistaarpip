import { useState } from "react";
import { runPrediction } from "../services/api";
import HealthScoreCircle from "../components/HealthScoreCircle";
import RiskCard from "../components/RiskCard";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { Sparkles, TrendingUp, TrendingDown, Brain, AlertTriangle } from "lucide-react";

export default function AIAnalysis() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await runPrediction();
      if (res.success) {
        setPrediction(res.data);
        try {
          const existing = JSON.parse(localStorage.getItem("norog_predictions") || "[]");
          localStorage.setItem("norog_predictions", JSON.stringify([res.data, ...existing].slice(0, 10)));
        } catch {}
        toast.success("Analysis complete! 🧬");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <LoadingOverlay visible={loading} message="🧬 Analyzing your health data and genetic risk factors..." />

      <div className="space-y-6">
        {/* Header - Redesigned Glass Theme */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-100 shadow-xl mb-2"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
          }}>
          <div className="absolute inset-0 pointer-events-none" style={{background: "linear-gradient(120deg, rgba(56,189,248,0.10) 0%, rgba(74,222,128,0.08) 100%)"}} />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-3xl shadow-lg animate-float border-2 border-white/40">🤖</div>
              <div>
                <h1 className="text-3xl font-extrabold text-sky-700 tracking-tight drop-shadow-sm">AI Risk Analysis</h1>
                <p className="text-base text-gray-500 mt-1 font-medium">Comprehensive AI-powered disease risk assessment</p>
              </div>
            </div>
            <button onClick={handlePredict} className="btn-primary flex items-center gap-2 text-base px-8 py-4 rounded-2xl flex-shrink-0 shadow-lg" disabled={loading}>
              <Sparkles size={20} />
              {prediction ? "Re-Analyze" : "Run Analysis"}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!prediction && !loading && (
          <div className="glass-card p-14 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-4xl mx-auto mb-5 animate-float shadow-lg">🧬</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Analysis Yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
              Click "Run Analysis" to get your AI-powered health risk assessment. Make sure you've completed your health profile for best results.
            </p>
            <button onClick={handlePredict} className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto">
              <Brain size={16} /> Run First Analysis
            </button>
          </div>
        )}

        {prediction && (
          <div className="space-y-6 animate-fade-in">
            {/* Score + Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Score Card */}
              <div className="glass-card p-7 flex flex-col items-center text-center"
                style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(34,211,238,0.04))" }}>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Health Score</h3>
                <HealthScoreCircle score={prediction.healthScore || 75} size={180} />
                <div className="mt-4 flex items-center gap-2">
                  {prediction.trend === "improving" ? <TrendingUp size={18} className="text-emerald-500" /> :
                   prediction.trend === "declining" ? <TrendingDown size={18} className="text-red-400" /> :
                   <span className="text-base">➡️</span>}
                  <span className="text-sm font-semibold text-gray-600 capitalize">
                    Trend: {prediction.trend || "stable"}
                  </span>
                </div>
              </div>

              {/* Summary Card */}
              <div className="glass-card p-7">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={16} className="text-sky-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Summary</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {prediction.summary || "No summary available."}
                </p>

                {prediction.seasonalAlert && (
                  <div className="mt-4 p-3.5 rounded-xl border border-yellow-200 flex items-start gap-2.5"
                    style={{ background: "linear-gradient(135deg, #fffbeb, #fef9c3)" }}>
                    <span className="text-lg flex-shrink-0">🌧️</span>
                    <div>
                      <span className="text-xs font-bold text-amber-600 block">Seasonal Alert</span>
                      <p className="text-xs text-amber-600 mt-0.5">{prediction.seasonalAlert}</p>
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-sky-50 text-xs text-gray-300">
                  Analyzed {new Date(prediction.createdAt || prediction.date || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Risk Cards */}
            {prediction.risks?.length > 0 && (
              <div className="animate-fade-in-up stagger-1">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h2 className="text-lg font-bold text-gray-700">Disease Risk Assessment</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-400 border border-red-100 font-semibold ml-1">
                    {prediction.risks.length} risks found
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prediction.risks.map((risk, i) => (
                    <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s`, opacity: 0, animationFillMode: "forwards" }}>
                      <RiskCard risk={risk} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptom Correlations */}
            {prediction.correlations?.length > 0 && (
              <div className="animate-fade-in-up stagger-2">
                <h2 className="text-lg font-bold text-gray-700 mb-4">🔗 Symptom Correlations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prediction.correlations.map((corr, i) => (
                    <div key={i} className="glass-card p-5">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {corr.symptoms?.map((s, j) => (
                          <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-lg">→</span>
                        <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{corr.possibleCondition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
