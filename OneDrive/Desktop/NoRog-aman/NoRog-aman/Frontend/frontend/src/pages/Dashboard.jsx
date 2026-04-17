import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfile, getSymptomHistory, checkSeasonal } from "../services/api";
import HealthScoreCircle from "../components/HealthScoreCircle";
import EarlyWarningBanner from "../components/EarlyWarningBanner";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [seasonal, setSeasonal] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([getProfile(), getSymptomHistory()]);
      if (profileRes.success) {
        const profileData = profileRes.data.profile;
        if (!profileData?.onboardingComplete) { navigate("/onboarding"); return; }
      }
      if (historyRes.success) {
        const logs = historyRes.data;
        setRecentLogs(logs);
        const warned = logs.find(l => l.warningFlagged);
        if (warned) setWarning({ reason: warned.warningReason, urgency: warned.warningUrgency });
      }
      try {
        const cached = localStorage.getItem("norog_predictions");
        if (cached) {
          const parsed = JSON.parse(cached);
          setPredictions(parsed);
          if (parsed.length > 0) setLatestPrediction(parsed[0]);
        }
      } catch {}
      try {
        if (!seasonal) {
          const seasonalRes = await checkSeasonal();
          if (seasonalRes.success && seasonalRes.data?.alert) setSeasonal(seasonalRes.data);
        }
      } catch {}
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally { setLoading(false); }
  };

  const sparkData = predictions.slice(0, 7).reverse().map(p => ({ score: p.healthScore || 75 }));
  if (sparkData.length === 0) sparkData.push({ score: 75 });

  const quickActions = [
    { icon: "📋", label: "Log Symptoms", path: "/symptoms", color: "from-sky-400 to-cyan-400" },
    { icon: "🤖", label: "AI Analysis", path: "/analysis", color: "from-violet-400 to-purple-400" },
    { icon: "🔮", label: "What-If", path: "/whatif", color: "from-teal-400 to-emerald-400" },
    { icon: "💊", label: "Medicines", path: "/medicines", color: "from-amber-400 to-orange-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 w-full py-2 space-y-8">
        {/* Welcome */}
        <section className="mb-4 rounded-2xl bg-linear-to-r from-sky-50 via-cyan-50 to-emerald-50 border border-sky-100 px-5 py-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!</h1>
          <p className="text-slate-600 text-sm md:text-base">Your health summary is updated here with trends, alerts, and quick actions.</p>
        </section>

        {/* Alerts */}
        {(warning || seasonal?.alert) && (
          <section className="space-y-3">
            {warning && <EarlyWarningBanner warning={warning} onDismiss={() => setWarning(null)} />}
            {seasonal?.alert && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-2xl">🌧️</span>
                <div className="flex-1">
                  <span className="block font-semibold text-slate-800">Seasonal Alert</span>
                  <span className="block text-slate-600 text-sm">{seasonal.alert}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Analytics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-4">Your Health Score</span>
            <HealthScoreCircle score={latestPrediction?.healthScore || 75} />
            <span className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${latestPrediction?.trend === 'improving' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {latestPrediction?.trend === "improving" ? <TrendingUp size={14}/> : <Activity size={14}/>} {latestPrediction?.trend || "Stable"}
            </span>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-slate-400 mb-2 block">Weekly Trend</span>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-slate-500 text-sm">
              {latestPrediction?.summary || "Keep logging daily for better insights."}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-slate-400 mb-2 block">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-sky-100 text-slate-700 hover:text-sky-700 transition-all border border-transparent hover:border-sky-200">
                  <span className="text-xl mb-1">{a.icon}</span>
                  <span className="text-xs font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-lg text-slate-800">Recent Logs</span>
            <button onClick={() => navigate("/history")} className="text-xs font-semibold text-sky-600 hover:underline">See All</button>
          </div>
          <div className="space-y-3">
            {recentLogs.length === 0 && <span className="text-slate-400 text-sm">No recent logs yet. Start by logging your symptoms!</span>}
            {recentLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer">
                <div className="text-center min-w-12">
                  <span className="block text-xs text-slate-400">{new Date(log.date).toLocaleDateString("en-US", { month: "short" })}</span>
                  <span className="block text-lg font-bold text-slate-800">{new Date(log.date).toLocaleDateString("en-US", { day: "numeric" })}</span>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {log.symptoms.map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-100">{s}</span>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-800">{log.severity}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-1">Sev</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}