import { useState, useEffect } from "react";
import { getSymptomHistory } from "../services/api";
import toast from "react-hot-toast";
import { Calendar, AlertOctagon, Filter } from "lucide-react";

const FILTERS = [
  { label: "All", value: "All", icon: "📁" },
  { label: "Symptom Logs", value: "Symptom Logs", icon: "📋" },
  { label: "Warnings", value: "Warnings", icon: "⚠️" },
];

export default function HealthHistory() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await getSymptomHistory();
      if (res.success) setLogs(res.data);
    } catch { toast.error("Failed to load history"); }
    finally { setLoading(false); }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "All") return true;
    if (filter === "Warnings") return log.warningFlagged;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading your health history...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(56,189,248,0.05))" }}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-2xl shadow-lg">📁</div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">Health History</h1>
          <p className="text-sm text-gray-400">Your complete health timeline — {logs.length} entries</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400 flex-shrink-0" />
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === f.value
                ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md"
                : "bg-white text-gray-500 border border-sky-100 hover:border-sky-300 hover:text-sky-500"
            }`}>
            <span className="text-base">{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredLogs.length === 0 && (
        <div className="glass-card p-14 text-center animate-fade-in">
          <div className="text-5xl mb-4 animate-float">📭</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">No entries yet</h3>
          <p className="text-sm text-gray-400">Start logging symptoms to build your health timeline.</p>
        </div>
      )}

      {/* Timeline */}
      {filteredLogs.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-sky-200 via-teal-200 to-violet-200 rounded-full" />

          <div className="space-y-4 pl-12">
            {filteredLogs.map((log, i) => (
              <div key={i} className="relative animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s`, opacity: 0, animationFillMode: "forwards" }}>
                {/* Timeline dot */}
                <div className={`absolute -left-8 top-5 w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 ${log.warningFlagged ? "bg-red-400" : "bg-gradient-to-br from-sky-400 to-teal-400"}`} />

                <div className="glass-card p-5">
                  {/* Date + badge row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-sky-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-gray-700">
                          {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.warningFlagged && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 font-semibold">
                          <AlertOctagon size={11} /> Warning
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className="severity-bar w-14">
                          <div className="severity-bar-fill" style={{
                            width: `${log.severity * 10}%`,
                            background: log.severity > 7 ? "linear-gradient(90deg,#f87171,#ef4444)" : log.severity > 4 ? "linear-gradient(90deg,#facc15,#f59e0b)" : "linear-gradient(90deg,#4ade80,#22d3ee)"
                          }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500">{log.severity}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {log.symptoms.map((s, j) => (
                      <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <p className="text-sm text-gray-400 mt-2 italic bg-gray-50 rounded-xl px-3 py-2">"{log.notes}"</p>
                  )}

                  {/* AI Photo Analysis */}
                  {log.photoAIDescription && (
                    <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-100">
                      <span className="text-xs font-bold text-sky-500 block mb-1">📸 AI Photo Analysis</span>
                      <p className="text-xs text-gray-500">{log.photoAIDescription}</p>
                    </div>
                  )}

                  {/* Warning detail */}
                  {log.warningFlagged && log.warningReason && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                      <span className="text-xs font-bold text-red-500 block mb-1">⚠️ Warning Details</span>
                      <p className="text-xs text-red-400">{log.warningReason}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
