import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const features = [
  { icon: "🤖", title: "AI Risk Prediction", desc: "Advanced AI analyzes symptoms, lifestyle, and genetics to predict disease risks before they strike.", color: "from-sky-400 to-cyan-400" },
  { icon: "🔮", title: "What-If Simulator", desc: "Explore how lifestyle changes impact your health over 1, 5, and 10 year timelines.", color: "from-violet-400 to-purple-400" },
  { icon: "💊", title: "Drug Interaction Check", desc: "Instantly detect dangerous medicine combinations before you take them.", color: "from-teal-400 to-emerald-400" },
  { icon: "🧬", title: "Genetic Risk Profiling", desc: "Factor in family history to uncover hereditary disease predispositions.", color: "from-pink-400 to-rose-400" },
  { icon: "🌧️", title: "Seasonal Alerts", desc: "AI-powered location-aware alerts for diseases common in your area this season.", color: "from-amber-400 to-orange-400" },
  { icon: "📄", title: "Doctor-Ready Reports", desc: "Generate comprehensive, shareable health reports for your physician in seconds.", color: "from-sky-400 to-blue-400" },
];

const benefits = [
  { icon: "🛡️", value: "Proactive", label: "Prevention-first approach" },
  { icon: "⚡", value: "Real-Time", label: "Continuous monitoring" },
  { icon: "🎯", value: "10+ Factors", label: "Analyzed per check" },
  { icon: "🔒", value: "Private", label: "Your data stays yours" },
];

export default function Landing() {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 30;
      const y = (clientY / innerHeight - 0.5) * 30;
      heroRef.current.style.setProperty("--mx", `${x}px`);
      heroRef.current.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #ecfdf5 100%)" }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="hero-orb w-96 h-96 bg-sky-300 top-[-80px] right-[-80px] animate-breathe" />
        <div className="hero-orb w-80 h-80 bg-teal-200 bottom-[-60px] left-[-60px] animate-float-alt" />
        <div className="hero-orb w-56 h-56 bg-violet-200 top-1/2 left-1/4 animate-float" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-sky-100/60"
        style={{ background: "rgba(255,255,255,0.85)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg, #38bdf8, #22d3ee)" }}>🩺</div>
            <span className="text-2xl font-extrabold">
              <span className="gradient-text">No</span>
              <span style={{ color: "#1f2937" }}>Rog</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-sky-500 transition-colors">Features</a>
            <a href="#benefits" className="hover:text-sky-500 transition-colors">Benefits</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:block text-sky-500 font-semibold px-5 py-2 rounded-full hover:bg-sky-50 transition-colors text-sm">
              Sign In
            </Link>
            <Link to="/auth" className="btn-primary text-sm px-6 py-2.5 rounded-full">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-24 pb-32 px-4 text-center overflow-hidden">
        {/* Doctor Avatar */}
        <div className="animate-bounce-in mb-8 flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-5xl animate-float"
              style={{ background: "linear-gradient(135deg, #e0f2fe, #ffffff)", boxShadow: "0 16px 48px rgba(56,189,248,0.3), 0 4px 12px rgba(0,0,0,0.06)", border: "2px solid rgba(56,189,248,0.2)" }}>
              👨‍⚕️
            </div>
            {/* Chat bubble */}
            <div className="absolute -top-3 -right-4 bg-white px-3 py-1.5 rounded-full shadow-lg border border-sky-100 text-sm font-semibold text-gray-700 whitespace-nowrap"
              style={{ boxShadow: "0 4px 16px rgba(56,189,248,0.2)" }}>
              Hi 👋 I'm NoRog AI
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-sky-100 shadow-md mb-8 animate-fade-in stagger-1">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">AI-Powered Preventive Healthcare</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up stagger-2 text-gray-900">
          Prevent Diseases<br />
          <span className="gradient-text">Before They Happen</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-fade-in-up stagger-3">
          NoRog uses AI to analyze your symptoms, lifestyle, and family history to predict health risks before they become serious. Stay one step ahead.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up stagger-4">
          <Link to="/auth" className="btn-primary text-base px-10 py-4 rounded-full flex items-center gap-2">
            Start for Free
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#features" className="btn-secondary text-base px-10 py-4 rounded-full">
            See Features ↓
          </a>
        </div>

        {/* Floating metric pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 animate-fade-in stagger-5">
          {benefits.map((b, i) => (
            <div key={i} className="glass-card px-5 py-3 flex items-center gap-3 hover:-translate-y-1">
              <span className="text-2xl">{b.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-800">{b.value}</div>
                <div className="text-xs text-gray-400">{b.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">
              Everything You Need
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Your Complete<br /><span className="gradient-text">Health Intelligence</span> Suite
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Six powerful modules working together to keep you healthy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="feature-card group animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-gradient-to-br ${f.color} shadow-lg`} style={{ opacity: 0.9 }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="benefits" className="relative z-10 py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #38bdf8, #22d3ee, #4ade80)", boxShadow: "0 20px 60px rgba(56,189,248,0.35)" }}>
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-float">🩺</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to take control of your health?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join NoRog and start monitoring your health proactively with AI. It's free to get started.
              </p>
              <Link to="/auth"
                className="inline-flex items-center gap-2 bg-white text-sky-600 font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-base">
                Create Your Account — Free
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 border-t border-sky-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🩺</span>
            <span className="text-xl font-extrabold"><span className="gradient-text">No</span><span className="text-gray-800">Rog</span></span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            ⚕️ NoRog is an AI-powered health intelligence tool, not a medical diagnosis system.
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}