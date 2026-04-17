import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser, loginUser } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setShowPass(false);
    setForm({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (tab === "register") {
        res = await registerUser(form);
      } else {
        res = await loginUser({ email: form.email, password: form.password });
      }
      if (res.success) {
        login(res.data.user, res.data.token);
        toast.success(tab === "register" ? "Account created! Welcome 🎉" : "Welcome back! 👋");
        if (tab === "register" || !res.data.onboardingComplete) {
          navigate("/onboarding");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #ecfdf5 100%)" }}>

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hero-orb w-96 h-96 bg-sky-200 -top-20 -right-20 animate-breathe" />
        <div className="hero-orb w-72 h-72 bg-teal-200 -bottom-16 -left-16 animate-float-alt" />
        <div className="hero-orb w-48 h-48 bg-violet-200 top-1/3 left-1/4 animate-float" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="relative bg-white/90 backdrop-blur-xl border border-sky-100 rounded-4xl p-8 md:p-10 shadow-xl"
          style={{ boxShadow: "0 16px 60px rgba(56,189,248,0.15), 0 4px 16px rgba(0,0,0,0.06)" }}>

          {/* Floating doctor avatar */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl animate-float"
              style={{
                background: "linear-gradient(135deg, #38bdf8, #22d3ee)",
                boxShadow: "0 12px 32px rgba(56,189,248,0.45)",
              }}>
              👨‍⚕️
            </div>
          </div>

          {/* Header */}
          <div className="text-center mt-12 mb-8">
            <h1 className="text-2xl font-extrabold text-gray-800">
              {tab === "login" ? "Welcome Back 👋" : "Join NoRog 🩺"}
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              {tab === "login" ? "Sign in to continue your health journey" : "Start your AI health journey today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-sky-50 rounded-2xl p-1 mb-8 border border-sky-100">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tab === t
                    ? "bg-white text-sky-600 shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {tab === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder={form.name ? "" : "Your full name"}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder={form.email ? "" : "you@example.com"}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pl-10 pr-12"
                  placeholder={form.password ? "" : "Min. 6 characters"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500 transition-colors text-xs font-semibold"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base rounded-2xl mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {tab === "register" ? "Create Account 🚀" : "Sign In →"}
                </>
              )}
            </button>
          </form>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {tab === "login" ? "New to NoRog? " : "Already have account? "}
              <button onClick={() => switchTab(tab === "login" ? "register" : "login")}
                className="text-sky-500 font-semibold hover:underline">
                {tab === "login" ? "Register" : "Sign in"}
              </button>
            </p>
            <p className="text-xs text-gray-300 mt-3">🔒 Secure • Private • AI-powered healthcare</p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-sky-500 transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}