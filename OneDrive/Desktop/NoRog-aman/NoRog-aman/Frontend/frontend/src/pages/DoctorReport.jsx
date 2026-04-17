import { useState } from "react";
import { downloadReport } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { Download, FileText, User, Activity, Pill, AlertTriangle, Heart, Shield } from "lucide-react";

const SECTIONS = [
  { icon: User, label: "Patient Summary", desc: "Name, age, gender, location", color: "from-sky-400 to-cyan-400" },
  { icon: Heart, label: "Medical History", desc: "Conditions, family history, lifestyle", color: "from-teal-400 to-emerald-400" },
  { icon: Activity, label: "Symptom History", desc: "Last 30 symptom log entries", color: "from-violet-400 to-purple-400" },
  { icon: Shield, label: "AI Risk Assessment", desc: "Disease risks with confidence scores", color: "from-pink-400 to-rose-400" },
  { icon: Pill, label: "Medicine Interactions", desc: "Any flagged drug interactions", color: "from-amber-400 to-orange-400" },
  { icon: AlertTriangle, label: "Disclaimer", desc: "AI-generated, not a diagnosis", color: "from-gray-400 to-gray-500" },
];

export default function DoctorReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await downloadReport();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `NoRog_HealthReport_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded! 📄");
    } catch { toast.error("Failed to generate report. Make sure you have health data."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      <LoadingOverlay visible={loading} message="📄 Generating your comprehensive health report..." />

      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(74,222,128,0.05))" }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-2xl shadow-lg">📄</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Doctor Report</h1>
            <p className="text-sm text-gray-400">Generate a comprehensive PDF to share with your physician</p>
          </div>
        </div>

        {/* Report Preview Card */}
        <div className="glass-card p-8 text-center">
          {/* Document Icon */}
          <div className="relative flex justify-center mb-6">
            <div className="w-20 h-24 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-2xl shadow-lg flex items-center justify-center relative animate-float border border-sky-200">
              <FileText size={32} className="text-sky-500" />
              {/* Fold */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-bl-xl rounded-tr-2xl border-b border-l border-sky-200 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[6px] border-r-[6px] border-t-sky-200 border-r-transparent" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full flex items-center justify-center shadow-md">
              <Shield size={12} className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Health Report Generator</h2>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            This report includes your patient summary, medical history, lifestyle data, symptom history, AI risk assessments, and medicine interactions.
          </p>

          {/* Section Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 text-left">
            {SECTIONS.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/60 border border-sky-100 hover:border-sky-300 hover:bg-sky-50 transition-all group">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <item.icon size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleDownload} className="btn-primary px-10 py-4 text-base rounded-2xl flex items-center gap-2 mx-auto" disabled={loading}>
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Download size={18} /> Generate & Download PDF</>
            )}
          </button>

          <p className="text-xs text-gray-300 mt-5 leading-relaxed">
            ⚕️ This report is AI-generated for informational purposes only.<br />
            It is not a medical diagnosis. Please consult a licensed physician.
          </p>
        </div>

        {/* What's included details */}
        <div className="glass-card p-5"
          style={{ background: "linear-gradient(135deg, rgba(250,204,21,0.06), rgba(251,191,36,0.04))" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <h3 className="text-sm font-bold text-amber-700 mb-1">For Best Results</h3>
              <ul className="text-xs text-amber-600 space-y-1 leading-relaxed">
                <li>✓ Complete your health profile via Onboarding</li>
                <li>✓ Log at least 3-5 symptom entries</li>
                <li>✓ Run an AI Analysis first for risk data</li>
                <li>✓ Add your current medicines in profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
