import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile } from "../services/api";
import toast from "react-hot-toast";

const COMMON_SYMPTOMS = ["Headache", "Fatigue", "Fever", "Cough", "Body ache", "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Joint pain", "Back pain", "Insomnia", "Anxiety", "Skin rash", "Stomach pain"];

const MEDICAL_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Thyroid disorder", "Heart disease", "Obesity", "PCOS", "Depression", "Arthritis", "Migraine", "Anemia", "Kidney disease"];

const RELATIONS = ["Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    age: "",
    gender: "",
    currentSymptoms: [],
    medicalHistory: [],
    otherCondition: "",
    familyHistory: [],
    lifestyle: {
      smoker: false,
      alcohol: "none",
      exerciseFrequency: "never",
      sleepHours: 7,
      diet: "balanced"
    },
    medicines: [],
    location: { city: "", country: "" }
  });

  const [newFH, setNewFH] = useState({ relation: "Father", condition: "" });
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "daily" });

  const toggleSymptom = (s) => {
    setData(d => ({
      ...d,
      currentSymptoms: d.currentSymptoms.includes(s)
        ? d.currentSymptoms.filter(x => x !== s)
        : [...d.currentSymptoms, s]
    }));
  };

  const toggleCondition = (c) => {
    setData(d => ({
      ...d,
      medicalHistory: d.medicalHistory.includes(c)
        ? d.medicalHistory.filter(x => x !== c)
        : [...d.medicalHistory, c]
    }));
  };

  const addFamilyHistory = () => {
    if (newFH.condition.trim()) {
      setData(d => ({ ...d, familyHistory: [...d.familyHistory, { ...newFH }] }));
      setNewFH({ relation: "Father", condition: "" });
    }
  };

  const addMedicine = () => {
    if (newMed.name.trim()) {
      setData(d => ({ ...d, medicines: [...d.medicines, { ...newMed }] }));
      setNewMed({ name: "", dosage: "", frequency: "daily" });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        age: Number(data.age) || undefined,
        gender: data.gender,
        location: data.location,
        currentSymptoms: data.currentSymptoms,
        medicalHistory: data.otherCondition
          ? [...data.medicalHistory, data.otherCondition]
          : data.medicalHistory,
        familyHistory: data.familyHistory,
        lifestyle: data.lifestyle,
        medicines: data.medicines
      };
      await saveProfile(payload);
      toast.success("Profile saved! Welcome to NoRog");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-2 relative z-10">
            <button
              onClick={() => navigate("/")}
              className="text-sm px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Back to Home
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Let's set up your health profile</h1>
            <p className="text-sm text-text-muted">Step {step} of 4 - This helps our AI provide accurate predictions</p>
          </div>
        </div>

        <div className="progress-bar mb-8">
          <div className="progress-bar-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        <div className="glass-card p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Basic Info & Current Symptoms</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Age</label>
                  <input type="number" className="input-field" placeholder="25" value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Gender</label>
                  <select className="input-field" value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Current Symptoms (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={`symptom-chip ${data.currentSymptoms.includes(s) ? "selected" : ""}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Medical History</h2>
              <p className="text-sm text-text-muted">Select any conditions you have been diagnosed with</p>

              <div className="flex flex-wrap gap-2">
                {MEDICAL_CONDITIONS.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)}
                    className={`symptom-chip ${data.medicalHistory.includes(c) ? "selected" : ""}`}>
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Other conditions</label>
                <input className="input-field" placeholder="Type any other condition..." value={data.otherCondition}
                  onChange={(e) => setData({ ...data, otherCondition: e.target.value })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Lifestyle</h2>

              <div className="flex items-center justify-between p-4 bg-bg-surface-alt rounded-xl">
                <span className="text-sm">Do you smoke?</span>
                <button
                  onClick={() => setData({ ...data, lifestyle: { ...data.lifestyle, smoker: !data.lifestyle.smoker } })}
                  className={`w-14 h-7 rounded-full transition-all ${data.lifestyle.smoker ? "bg-danger" : "bg-border"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${data.lifestyle.smoker ? "translate-x-7" : ""}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Alcohol Consumption</label>
                <select className="input-field" value={data.lifestyle.alcohol}
                  onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, alcohol: e.target.value } })}>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="regular">Regular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Exercise Frequency</label>
                <select className="input-field" value={data.lifestyle.exerciseFrequency}
                  onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, exerciseFrequency: e.target.value } })}>
                  <option value="never">Never</option>
                  <option value="1-2x">1-2 times/week</option>
                  <option value="3-5x">3-5 times/week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Sleep Hours: {data.lifestyle.sleepHours}hrs</label>
                <input type="range" min="3" max="12" step="0.5" value={data.lifestyle.sleepHours}
                  className="w-full accent-brand"
                  onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, sleepHours: Number(e.target.value) } })} />
                <div className="flex justify-between text-xs text-text-muted">
                  <span>3hrs</span><span>12hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Diet Type</label>
                <select className="input-field" value={data.lifestyle.diet}
                  onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, diet: e.target.value } })}>
                  <option value="balanced">Balanced</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="junk-heavy">Junk Food Heavy</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold">Family History & Medications</h2>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Family History (Genetic Risk Mode)</label>
                <div className="flex gap-2 mb-2">
                  <select className="input-field shrink-0 w-32" value={newFH.relation}
                    onChange={(e) => setNewFH({ ...newFH, relation: e.target.value })}>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input className="input-field flex-1" placeholder="Condition (e.g., Heart Disease)"
                    value={newFH.condition} onChange={(e) => setNewFH({ ...newFH, condition: e.target.value })} />
                  <button onClick={addFamilyHistory} className="btn-primary px-4 py-2 text-sm">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.familyHistory.map((fh, i) => (
                    <span key={i} className="symptom-chip selected">
                      {fh.relation} {'->'} {fh.condition}
                      <button className="ml-2" onClick={() => setData(d => ({ ...d, familyHistory: d.familyHistory.filter((_, j) => j !== i) }))}>x</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Current Medicines</label>
                <div className="flex gap-2 mb-2">
                  <input className="input-field flex-1" placeholder="Medicine name" value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} />
                  <input className="input-field w-24" placeholder="Dosage" value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} />
                  <button onClick={addMedicine} className="btn-primary px-4 py-2 text-sm">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.medicines.map((m, i) => (
                    <span key={i} className="symptom-chip selected">
                      {m.name} {m.dosage}
                      <button className="ml-2" onClick={() => setData(d => ({ ...d, medicines: d.medicines.filter((_, j) => j !== i) }))}>x</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">City</label>
                  <input className="input-field" placeholder="Mumbai" value={data.location.city}
                    onChange={(e) => setData({ ...data, location: { ...data.location, city: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Country</label>
                  <input className="input-field" placeholder="India" value={data.location.country}
                    onChange={(e) => setData({ ...data, location: { ...data.location, country: e.target.value } })} />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/")}
                className="text-sm px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Back to Home
              </button>
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary"
                style={{ visibility: step === 1 ? "hidden" : "visible" }}>
                Back
              </button>
            </div>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
