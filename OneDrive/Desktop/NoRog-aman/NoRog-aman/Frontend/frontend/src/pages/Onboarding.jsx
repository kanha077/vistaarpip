import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile } from "../services/api";
import toast from "react-hot-toast";


const COMMON_SYMPTOMS = ["Headache", "Fatigue", "Fever", "Cough", "Body ache", "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Joint pain", "Back pain", "Insomnia", "Anxiety", "Skin rash", "Stomach pain"];
const MEDICAL_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Thyroid disorder", "Heart disease", "Obesity", "PCOS", "Depression", "Arthritis", "Migraine", "Anemia", "Kidney disease"];
const RELATIONS = ["Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother"];

const STEPS = [
  { icon: "👤", label: "Basic Info" },
  { icon: "🩺", label: "Symptoms" },
  { icon: "🏥", label: "Medical History" },
  { icon: "🏃", label: "Lifestyle" },
  { icon: "🧬", label: "History & Meds" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    age: "", gender: "", currentSymptoms: [], medicalHistory: [], otherCondition: "",
    familyHistory: [],
    lifestyle: { smoker: false, alcohol: "none", exerciseFrequency: "never", sleepHours: 7, diet: "balanced" },
    medicines: [], location: { city: "", country: "" }
  });
  const [newFH, setNewFH] = useState({ relation: "Father", condition: "" });
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "daily" });

  const handleMouseMove = (e) => {
    if (!isHovering) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const tiltX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -3;
    const tiltY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 3;
    setTilt({ x: tiltX, y: tiltY });
  };
  const handleMouseLeave = () => { setIsHovering(false); setTilt({ x: 0, y: 0 }); };

  const toggleSymptom = (s) => setData(d => ({ ...d, currentSymptoms: d.currentSymptoms.includes(s) ? d.currentSymptoms.filter(x => x !== s) : [...d.currentSymptoms, s] }));
  const toggleCondition = (c) => setData(d => ({ ...d, medicalHistory: d.medicalHistory.includes(c) ? d.medicalHistory.filter(x => x !== c) : [...d.medicalHistory, c] }));
  const addFamilyHistory = () => { if (newFH.condition.trim()) { setData(d => ({ ...d, familyHistory: [...d.familyHistory, { ...newFH }] })); setNewFH({ relation: "Father", condition: "" }); } };
  const addMedicine = () => { if (newMed.name.trim()) { setData(d => ({ ...d, medicines: [...d.medicines, { ...newMed }] })); setNewMed({ name: "", dosage: "", frequency: "daily" }); } };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { age: Number(data.age) || undefined, gender: data.gender, location: data.location, currentSymptoms: data.currentSymptoms, medicalHistory: data.otherCondition ? [...data.medicalHistory, data.otherCondition] : data.medicalHistory, familyHistory: data.familyHistory, lifestyle: data.lifestyle, medicines: data.medicines };
      await saveProfile({ ...payload, onboardingComplete: true });
      toast.success("Profile saved! Welcome to NoRog 🩺");
      navigate("/dashboard");
    } catch { toast.error("Failed to save profile. Please try again."); }
    finally { setLoading(false); }
  };

  const inputClass = "input-field";
  const chip = (selected) => `px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${selected ? "symptom-chip selected" : "symptom-chip"}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 55%, #ecfdf5 100%)" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="hero-orb w-96 h-96 bg-sky-200 top-[-100px] right-[-60px] animate-breathe" />
        <div className="hero-orb w-80 h-80 bg-teal-200 bottom-[-80px] left-[-60px] animate-float-alt" />
        <div className="hero-orb w-56 h-56 bg-violet-200 top-1/2 left-[10%] animate-float" />
      </div>

      <div className="w-full max-w-2xl relative z-10">

        {/* AI Assistant Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-float flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #38bdf8, #22d3ee)", boxShadow: "0 10px 30px rgba(56,189,248,0.4)" }}>
            👨‍⚕️
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Let's build your health profile</h1>
            <p className="text-gray-400 text-sm mt-0.5">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in stagger-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 flex-shrink-0 ${
                i + 1 < step ? "bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-md" :
                i + 1 === step ? "bg-gradient-to-br from-sky-400 to-cyan-400 text-white shadow-lg scale-105" :
                "bg-sky-50 text-gray-300 border border-sky-100"
              }`}>
                {i + 1 < step ? "✓" : s.icon.slice(0, 2)}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${i + 1 < step ? "bg-gradient-to-r from-sky-400 to-teal-400" : "bg-sky-100"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-8 animate-fade-in stagger-2">
          <div className="progress-bar-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>

        {/* Main Card with 3D Tilt */}
        <div
          className="bg-white/90 backdrop-blur-2xl border border-sky-100 rounded-[2rem] p-8 md:p-10 transition-all ease-out duration-200 animate-fade-in-up stagger-2"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            boxShadow: "0 16px 60px rgba(56,189,248,0.12), 0 4px 16px rgba(0,0,0,0.05)",
            transform: isHovering ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.01)` : "rotateX(0) rotateY(0) scale(1)",
          }}
        >
          <div key={step} className="animate-fade-in space-y-8">

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-2xl">👤</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                    <p className="text-sm text-gray-400">Tell us a bit about yourself</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Age</label>
                    <input type="number" min="0" className={inputClass} placeholder="e.g. 25" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value ? Math.max(0, parseInt(e.target.value, 10)).toString().slice(0,3) : '' })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
                    <select className={inputClass} value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}>
                      <option value="">Select identity</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">City</label>
                    <input className={inputClass} placeholder="e.g. Mumbai" value={data.location.city} onChange={(e) => setData({ ...data, location: { ...data.location, city: e.target.value } })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Country</label>
                    <input className={inputClass} placeholder="e.g. India" value={data.location.country} onChange={(e) => setData({ ...data, location: { ...data.location, country: e.target.value } })} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Symptoms */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-2xl">🩺</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Current Symptoms</h2>
                    <p className="text-sm text-gray-400">Select all that apply</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {COMMON_SYMPTOMS.map((s, idx) => (
                    <button key={s} type="button" onClick={() => toggleSymptom(s)}
                      className={chip(data.currentSymptoms.includes(s))}
                      style={{ animationDelay: `${idx * 0.03}s` }}>
                      {s}
                    </button>
                  ))}
                </div>
                {data.currentSymptoms.length > 0 && (
                  <div className="pt-3 border-t border-sky-50">
                    <span className="text-xs font-semibold text-sky-500 uppercase tracking-wider">{data.currentSymptoms.length} selected</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Medical History */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">🏥</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Medical History</h2>
                    <p className="text-sm text-gray-400">Known diagnosed conditions</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {MEDICAL_CONDITIONS.map((c, idx) => (
                    <button key={c} type="button" onClick={() => toggleCondition(c)}
                      className={chip(data.medicalHistory.includes(c))}>
                      {c}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Other conditions</label>
                  <input className={inputClass} placeholder="Type any other condition not listed..." value={data.otherCondition} onChange={(e) => setData({ ...data, otherCondition: e.target.value })} />
                </div>
              </div>
            )}

            {/* Step 4: Lifestyle */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl">🏃</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Lifestyle Factors</h2>
                    <p className="text-sm text-gray-400">Help AI understand your daily habits</p>
                  </div>
                </div>

                {/* Smoker toggle */}
                <div className="flex items-center justify-between p-5 bg-sky-50/60 rounded-2xl border border-sky-100 cursor-pointer hover:border-sky-300 transition-colors"
                  onClick={() => setData({ ...data, lifestyle: { ...data.lifestyle, smoker: !data.lifestyle.smoker } })}>
                  <div>
                    <span className="font-semibold text-gray-700">Do you smoke?</span>
                    <p className="text-xs text-gray-400 mt-0.5">Smoking significantly impacts health risk</p>
                  </div>
                  <button className={`toggle ${data.lifestyle.smoker ? "on" : ""}`} onClick={e => e.stopPropagation()}>
                    <div className="toggle-thumb" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Alcohol</label>
                    <select className={inputClass} value={data.lifestyle.alcohol} onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, alcohol: e.target.value } })}>
                      <option value="none">None</option>
                      <option value="occasional">Occasional</option>
                      <option value="regular">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Exercise</label>
                    <select className={inputClass} value={data.lifestyle.exerciseFrequency} onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, exerciseFrequency: e.target.value } })}>
                      <option value="never">Never</option>
                      <option value="1-2x">1–2×/week</option>
                      <option value="3-5x">3–5×/week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </div>

                {/* Sleep slider */}
                <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sleep Hours</label>
                    <span className="text-2xl font-extrabold gradient-text">{data.lifestyle.sleepHours}
                      <span className="text-base font-medium text-gray-400 ml-1">hrs</span>
                    </span>
                  </div>
                  <input type="range" min="3" max="12" step="0.5" value={data.lifestyle.sleepHours}
                    onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, sleepHours: Number(e.target.value) } })} />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>3 hrs</span><span>7.5 hrs (ideal)</span><span>12 hrs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Diet Type</label>
                  <select className={inputClass} value={data.lifestyle.diet} onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, diet: e.target.value } })}>
                    <option value="balanced">Balanced</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="junk-heavy">Junk Food Heavy</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Family History + Medicines */}
            {step === 5 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-5 border-b border-sky-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-2xl">🧬</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Family History & Medicines</h2>
                    <p className="text-sm text-gray-400">Genetic risk profiling & current meds</p>
                  </div>
                </div>

                {/* Family History */}
                <div className="bg-sky-50/50 rounded-2xl p-5 border border-sky-100">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Family History</label>
                  <div className="flex gap-2 mb-3">
                    <select className="input-field w-32 flex-shrink-0" value={newFH.relation} onChange={(e) => setNewFH({ ...newFH, relation: e.target.value })}>
                      {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input className="input-field flex-1" placeholder="Condition (e.g., Diabetes)" value={newFH.condition}
                      onChange={(e) => setNewFH({ ...newFH, condition: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && addFamilyHistory()} />
                    <button onClick={addFamilyHistory} className="btn-primary px-4 rounded-xl flex-shrink-0">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.familyHistory.map((fh, i) => (
                      <span key={i} className="inline-flex items-center gap-2 bg-sky-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                        <span className="text-sky-200 text-xs">{fh.relation}</span>
                        <span>{fh.condition}</span>
                        <button onClick={() => setData(d => ({ ...d, familyHistory: d.familyHistory.filter((_, j) => j !== i) }))}
                          className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors text-xs">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medicines */}
                <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Current Medicines</label>
                  <div className="flex gap-2 mb-3">
                    <input className="input-field flex-1" placeholder="Medicine name" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} />
                    <input className="input-field w-28 flex-shrink-0" placeholder="Dosage" value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && addMedicine()} />
                    <button onClick={addMedicine} className="btn-primary px-4 rounded-xl flex-shrink-0">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.medicines.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-2 bg-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                        💊 {m.name} {m.dosage && <span className="text-teal-200 text-xs">{m.dosage}</span>}
                        <button onClick={() => setData(d => ({ ...d, medicines: d.medicines.filter((_, j) => j !== i) }))}
                          className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors text-xs">✕</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-7 border-t border-sky-50">
            <button onClick={() => setStep(s => s - 1)}
              className="btn-secondary px-7 py-3 rounded-full flex items-center gap-2 text-sm"
              style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto" }}>
              ← Back
            </button>

            {step < STEPS.length ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 text-sm">
                Continue
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 text-sm min-w-[168px] justify-center">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>Complete Setup ✓</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}