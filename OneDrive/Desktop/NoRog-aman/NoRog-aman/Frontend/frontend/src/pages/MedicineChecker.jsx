import { useState, useEffect } from "react";
import { getProfile, checkMedicineInteractions } from "../services/api";
import { getGeminiMedicineInsight } from "../services/gemini";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { X, Plus, Search, ShieldCheck, ShieldAlert } from "lucide-react";

export default function MedicineChecker() {
  const [profileMeds, setProfileMeds] = useState([]);
  const [tempMeds, setTempMeds] = useState([]);
  const [newMed, setNewMed] = useState("");
  const [result, setResult] = useState(null);
  const [geminiAdvice, setGeminiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data.profile?.medicines) {
        setProfileMeds(res.data.profile.medicines.map(m => m.name));
      }
    } catch {} finally { setLoadingProfile(false); }
  };

  const addTempMed = () => {
    if (newMed.trim() && !tempMeds.includes(newMed.trim())) {
      setTempMeds([...tempMeds, newMed.trim()]);
      setNewMed("");
    }
  };
  const removeTempMed = (med) => setTempMeds(tempMeds.filter(m => m !== med));

  const checkInteractions = async () => {
    const allMeds = [...profileMeds, ...tempMeds];
    if (allMeds.length < 2) { toast.error("Need at least 2 medicines to check interactions"); return; }
    setLoading(true);
    setGeminiAdvice("");
    try {
      const res = await checkMedicineInteractions(allMeds);
      if (res.success) {
        setResult(res.data);
        const advice = await getGeminiMedicineInsight({
          medicines: allMeds,
          interactionResult: res.data
        });
        setGeminiAdvice(advice);
        toast.success("Interaction check complete! 💊");
      }
    } catch (err) { toast.error(err.response?.data?.error || "Check failed"); }
    finally { setLoading(false); }
  };

  const severityConfig = {
    mild: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", label: "Mild", dot: "bg-emerald-400" },
    moderate: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", label: "Moderate", dot: "bg-amber-400" },
    severe: { bg: "bg-red-50", border: "border-red-200", text: "text-red-500", label: "Severe", dot: "bg-red-500" },
  };

  if (loadingProfile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading your medicines...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto relative">
      <LoadingOverlay visible={loading} message="💊 Scanning for drug interactions..." />

      <div className="space-y-5">
        {/* Header */}
        <div className="glass-card p-5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(45,212,191,0.05))" }}>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-2xl shadow-lg">💊</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Medicine Interaction Checker</h1>
            <p className="text-sm text-gray-400">Detect dangerous drug-drug and drug-disease interactions</p>
          </div>
        </div>

        {/* Profile Medicines */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0">P</span>
            Your Profile Medicines
          </h3>
          {profileMeds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileMeds.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full bg-teal-500 text-white font-semibold shadow-md">
                  💊 {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">No medicines in your profile. Add below to check.</p>
          )}
        </div>

        {/* Add Medicines */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-3">Add Medicines to Check</h3>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9 text-sm"
                placeholder="e.g., Ibuprofen, Aspirin..."
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTempMed()}
              />
            </div>
            <button onClick={addTempMed} className="btn-primary px-4 rounded-xl flex items-center gap-1.5 text-sm shrink-0">
              <Plus size={16} /> Add
            </button>
          </div>
          {tempMeds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tempMeds.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-700 font-semibold border border-sky-200">
                  {m}
                  <button onClick={() => removeTempMed(m)} className="hover:text-red-500 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Check Button */}
        <button onClick={checkInteractions} className="btn-primary w-full py-4 rounded-2xl text-base flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</> : <><Search size={16} /> Check Interactions</>}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Safe / Unsafe Banner */}
            <div className={`glass-card p-5 text-center ${result.safeToTake ? "border-emerald-200" : "border-red-200"}`}
              style={{ background: result.safeToTake ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)" : "linear-gradient(135deg, #fff1f2, #fef2f2)" }}>
              <div className="flex items-center justify-center gap-3 mb-2">
                {result.safeToTake
                  ? <ShieldCheck size={32} className="text-emerald-500" />
                  : <ShieldAlert size={32} className="text-red-500" />}
                <div className="text-left">
                  <h3 className={`text-lg font-extrabold ${result.safeToTake ? "text-emerald-700" : "text-red-600"}`}>
                    {result.safeToTake ? "All Clear ✅" : "Interactions Found ⚠️"}
                  </h3>
                  <p className={`text-sm ${result.safeToTake ? "text-emerald-600" : "text-red-500"}`}>
                    {result.safeToTake ? "No dangerous interactions detected" : "Consult your doctor before taking these together"}
                  </p>
                </div>
              </div>
            </div>

            {/* Drug-Drug Interactions */}
            {result.drugInteractions?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3">Drug–Drug Interactions</h3>
                <div className="space-y-3">
                  {result.drugInteractions.map((inter, i) => {
                    const cfg = severityConfig[inter.severity] || severityConfig.mild;
                    return (
                      <div key={i} className={`glass-card p-4 risk-${inter.severity === "severe" ? "high" : inter.severity === "moderate" ? "moderate" : "low"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-700">{inter.drug1} + {inter.drug2}</span>
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{inter.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drug-Disease */}
            {result.diseaseInteractions?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3">Drug–Condition Interactions</h3>
                <div className="space-y-3">
                  {result.diseaseInteractions.map((inter, i) => (
                    <div key={i} className="glass-card p-4 risk-moderate">
                      <span className="font-semibold text-sm text-gray-700 block">{inter.drug} + {inter.condition}</span>
                      <p className="text-sm text-gray-500 mt-1">{inter.warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {(geminiAdvice || result.recommendation) && (
              <div className="glass-card p-5 border-sky-200"
                style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)" }}>
                <h3 className="text-sm font-bold text-sky-600 mb-2 flex items-center gap-1.5">💡 NoRog AI Recommendation</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{geminiAdvice || result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
