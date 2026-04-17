import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SymptomLogger from "./pages/SymptomLogger";
import AIAnalysis from "./pages/AIAnalysis";
import WhatIf from "./pages/WhatIf";
import MedicineChecker from "./pages/MedicineChecker";
import HealthHistory from "./pages/HealthHistory";
import DoctorReport from "./pages/DoctorReport";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const noNavRoutes = ["/", "/auth", "/onboarding"];
  const showNav = isAuthenticated && !noNavRoutes.includes(location.pathname);

  return (
    <div>
      {showNav && <Navbar />}
      <main className={`min-h-screen ${showNav ? "w-full px-6 lg:px-12 py-6" : ""}`}>
        <div className={showNav ? "max-w-7xl mx-auto" : ""}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
            
            {/* Onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            
            {/* Protected app routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/symptoms" element={
              <ProtectedRoute><SymptomLogger /></ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute><AIAnalysis /></ProtectedRoute>
            } />
            <Route path="/whatif" element={
              <ProtectedRoute><WhatIf /></ProtectedRoute>
            } />
            <Route path="/medicines" element={
              <ProtectedRoute><MedicineChecker /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><HealthHistory /></ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute><DoctorReport /></ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Disclaimer Footer (only on main pages) */}
      {showNav && (
        <footer className="text-center py-4 px-4 text-xs text-slate-500">
          <p>⚕️ NoRog is an AI-powered health intelligence tool, not a medical diagnosis system.</p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
