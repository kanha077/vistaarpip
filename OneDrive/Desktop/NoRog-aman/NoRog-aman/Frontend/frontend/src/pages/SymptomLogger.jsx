import { useState, useRef, useEffect } from "react";
import { getGeminiSummary, getGeminiSuggestions } from "../services/gemini";
import { useNavigate } from "react-router-dom";
import { logSymptoms } from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { Search, X, Clock } from "lucide-react";
import symptomsLibrary from "../data/symptoms.json";


export default function SymptomLogger() {
  // Helper: Fuzzy match (simple, can be replaced with fuse.js for large sets)
  function fuzzyMatch(str, query) {
    if (!query) return true;
    str = str.toLowerCase();
    query = query.toLowerCase();
    if (str.includes(query)) return true;
    // Check synonyms
    return false;
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="bg-yellow-100 text-yellow-800 font-bold">{text.slice(idx, idx+query.length)}</span>{text.slice(idx+query.length)}</>;
  }

  // selected: [{id, name, timestamp}]
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState([]); // [{id, name, timestamp}]
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const [lastLog, setLastLog] = useState(null); // Store last log output
  // Gemini-powered autocomplete suggestions
  const [geminiSuggestions, setGeminiSuggestions] = useState([]);
  useEffect(() => {
    let ignore = false;
    async function fetchSuggestions() {
      if (!search) { setGeminiSuggestions([]); return; }
      try {
        const arr = await getGeminiSuggestions(search);
        if (!ignore) setGeminiSuggestions(arr);
      } catch { if (!ignore) setGeminiSuggestions([]); }
    }
    fetchSuggestions();
    return () => { ignore = true; };
  }, [search]);

  // Fuzzy filter and rank
  const getFiltered = () => {
    if (!search) return [];
    const q = search.toLowerCase();
    // Fuzzy and synonym match
    let matches = symptomsLibrary.filter(symp => {
      if (symp.name.toLowerCase().includes(q)) return true;
      if (symp.synonyms && symp.synonyms.some(syn => syn.toLowerCase().includes(q))) return true;
      // Fuzzy: allow 1 typo (Levenshtein, simple)
      return false;
    });
    // Rank: recent first, then by name
    matches = matches.sort((a, b) => {
      const aRecent = recent.find(r => r.id === a.id);
      const bRecent = recent.find(r => r.id === b.id);
      if (aRecent && !bRecent) return -1;
      if (!aRecent && bRecent) return 1;
      return a.name.localeCompare(b.name);
    });
    return matches;
  };

  const filteredSymptoms = getFiltered();

  // Add or remove symptom by id
  const toggleSymptom = (symptom) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (exists) return prev.filter(s => s.id !== symptom.id);
      const newSel = [...prev, { ...symptom, timestamp: Date.now() }];
      // Update recent
      setRecent(r => [{ ...symptom, timestamp: Date.now() }, ...r.filter(x => x.id !== symptom.id)].slice(0, 5));
      return newSel;
    });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) { toast.error("Select at least one symptom"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("symptoms", JSON.stringify(selected.map(s => s.name)));
      formData.append("severity", severity);
      formData.append("notes", notes);
      if (photo) formData.append("photo", photo);
      
      const res = await logSymptoms(formData);
      
      if (res.success) {
        toast.success("Symptoms logged successfully! ✅");
        
        // Show a brief toast instead of the entire paragraph
        if (res.data.warning?.warningTriggered) {
          toast("High severity pattern detected. See insights.", { icon: "⚠️", duration: 6000 });
        }

        // Call Gemini for summary (with photo if available)
        let geminiSummary = await getGeminiSummary({
          symptoms: selected.map(s => s.name),
          severity,
          notes,
          photo: photoPreview
        });

        // Fallback: If frontend AI fails, use the backend's detailed warning text in the modal
        if (!geminiSummary || geminiSummary.includes("No summary available") || geminiSummary.includes("could not generate")) {
          geminiSummary = res.data.warning?.warningTriggered 
            ? res.data.warning.reason 
            : "No summary available. (NoRog AI could not generate a response. Please try again later.)";
        }

        setLastLog({
          symptoms: selected.map(s => s.name),
          severity,
          notes,
          photo: photoPreview,
          date: new Date().toLocaleString(),
          geminiSummary
        });
        
        setSelected([]); setSeverity(5); setNotes(""); setPhoto(null); setPhotoPreview(null);
      }
    } catch { 
      toast.error("Failed to log symptoms. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const severityGrad = severity > 7 ? "linear-gradient(90deg, #f87171, #ef4444)" : severity > 4 ? "linear-gradient(90deg, #facc15, #f59e0b)" : "linear-gradient(90deg, #4ade80, #22d3ee)";
  const severityLabel = severity > 7 ? "Severe 🔴" : severity > 4 ? "Moderate 🟡" : "Mild 🟢";
  const severityTextColor = severity > 7 ? "text-red-500" : severity > 4 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="max-w-2xl mx-auto relative">
      <LoadingOverlay visible={loading} message="🔍 Analyzing your symptoms and checking for warnings..." />

      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(74,222,128,0.05))" }}>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-2xl shadow-lg">📋</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Log Symptoms</h1>
            <p className="text-sm text-gray-400">Track how you feel for accurate AI predictions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Symptom Search & Selection */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600">Search & Add Symptoms</h3>
              {selected.length > 0 && (
                <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9 text-sm"
                placeholder="Type to search symptoms (e.g. stomach ache, fever)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {/* Recent/Frequent */}
            {recent.length > 0 && !search && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Clock size={12}/> Recent</div>
                <div className="flex flex-wrap gap-2">
                  {recent.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleSymptom(s)}
                      className={`symptom-chip text-xs ${selected.find(sel => sel.id === s.id) ? "selected" : ""}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Search Results & Gemini Suggestions */}
            {search && (
              <div className="max-h-52 overflow-y-auto pb-1 border rounded-lg bg-white shadow mt-1">
                {filteredSymptoms.length > 0 ? filteredSymptoms.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleSymptom(s)}
                    className={`w-full text-left px-4 py-2 hover:bg-sky-50 flex items-center gap-2 ${selected.find(sel => sel.id === s.id) ? "bg-sky-100 text-sky-700" : "text-slate-700"}`}>
                    {highlightMatch(s.name, search)}
                    {s.synonyms && s.synonyms.some(syn => syn.toLowerCase().includes(search.toLowerCase())) && (
                      <span className="ml-2 text-xs text-gray-400">({s.synonyms.find(syn => syn.toLowerCase().includes(search.toLowerCase()))})</span>
                    )}
                  </button>
                )) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No match found. <button type="button" className="underline text-sky-600" onClick={() => {
                    // Add custom symptom
                    const custom = { id: `custom-${Date.now()}`, name: search, timestamp: Date.now() };
                    setSelected(prev => [...prev, custom]);
                    setSearch("");
                  }}>Add "{search}" as custom symptom</button></div>
                )}
                {/* Gemini Suggestions */}
                {geminiSuggestions.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <div className="text-xs text-sky-700 font-semibold mb-1">Gemini Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {geminiSuggestions.map((sugg, i) => (
                        <button key={i} type="button" onClick={() => setSearch(sugg)} className="px-2 py-1 rounded bg-sky-100 text-sky-700 text-xs hover:bg-sky-200 transition">{sugg}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Selected List */}
            {selected.length > 0 && (
              <div className="mt-3 pt-3 border-t border-sky-50">
                <p className="text-xs text-gray-400 mb-2">Selected symptoms:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-sky-500 text-white font-medium shadow-md">
                      {s.name}
                      <button type="button" onClick={() => toggleSymptom(s)} className="hover:text-red-200 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Severity Slider */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-600">Severity Level</h3>
              <span className={`text-sm font-extrabold ${severityTextColor}`}>{severity}/10 · {severityLabel}</span>
            </div>
            <input type="range" min="1" max="10" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Mild</span><span>Moderate</span><span>Severe</span>
            </div>
            <div className="severity-bar mt-3">
              <div className="severity-bar-fill" style={{ width: `${severity * 10}%`, background: severityGrad }} />
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-gray-600 mb-3">Additional Notes</h3>
            <textarea
              className="input-field resize-none h-24 text-sm"
              placeholder="Describe how you're feeling, when symptoms started, what makes it better or worse..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Photo Upload */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-gray-600 mb-1.5">📸 Photo Upload <span className="text-gray-400 font-normal">(Optional)</span></h3>
            <p className="text-xs text-gray-400 mb-3">Upload a photo of visible symptoms (rash, swelling, etc.) for AI analysis</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={photoPreview} alt="Symptom" className="max-h-48 object-cover w-full rounded-2xl" />
                <button type="button"
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-sky-200 rounded-2xl text-gray-400 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 transition-all text-sm font-medium">
                📷 Click to upload photo
              </button>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary w-full py-4 rounded-2xl text-base flex items-center justify-center gap-2" disabled={loading || selected.length === 0}>
            {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</> : "Log Symptoms & Check Warnings ✓"}
          </button>
        </form>
      </div>

      {/* Fullscreen Gemini Summary Modal */}
      {lastLog && lastLog.geminiSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in p-4">
          <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold" onClick={() => setLastLog(null)} aria-label="Close">&times;</button>
            <div className="flex items-center gap-3 mb-6">
              <img src="/NoRog-logo-final.png" alt="NoRog AI" className="w-10 h-10" />
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-700">NoRog AI Medical Insight</span>
            </div>
            <div className="w-full max-w-3xl text-lg sm:text-xl text-slate-800 whitespace-pre-line italic mb-6 overflow-y-auto" style={{minHeight: '120px'}}>{lastLog.geminiSummary}</div>
            <div className="w-full flex flex-col items-center gap-3 mt-4">
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {lastLog.symptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-base font-semibold">{s}</span>
                ))}
              </div>
              <div className="text-lg"><span className="font-semibold">Severity:</span> <span className="font-mono">{lastLog.severity}/10</span></div>
              {lastLog.notes && <div className="text-base max-w-2xl"><span className="font-semibold">Notes:</span> {lastLog.notes}</div>}
              <div className="text-xs text-gray-400">Logged at: {lastLog.date}</div>
              {lastLog.photo && (
                <div className="mt-2"><img src={lastLog.photo} alt="Symptom" className="max-h-40 sm:max-h-48 rounded-xl border mx-auto" /></div>
              )}
            </div>
            <button className="mt-8 px-8 py-3 rounded-xl bg-sky-500 text-white text-lg font-bold hover:bg-sky-600 transition-transform hover:scale-105" onClick={() => setLastLog(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
