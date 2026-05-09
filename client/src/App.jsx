import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { ThemeProvider }   from "./context/ThemeContext";
import ProtectedRoute      from "./components/ProtectedRoute";

// Public pages — eager (tiny, needed immediately)
import LandingPage         from "./pages/LandingPage";
import Login               from "./pages/Login";
import Signup              from "./pages/Signup";
import GoogleAuthSuccess   from "./pages/GoogleAuthSuccess";

// Protected pages — lazy loaded (only fetched after auth)
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const Chat            = lazy(() => import("./pages/Chat"));
const Crops           = lazy(() => import("./pages/Crops"));
const Plans           = lazy(() => import("./pages/Plans"));
const PlanDetail      = lazy(() => import("./pages/PlanDetail"));
const Profile         = lazy(() => import("./pages/Profile"));
const Settings        = lazy(() => import("./pages/Settings"));
const DiseaseDetection = lazy(() => import("./pages/DiseaseDetection"));
const ProfitPlanner    = lazy(() => import("./pages/ProfitPlanner"));
const Intelligence     = lazy(() => import("./pages/Intelligence"));
const Satellite        = lazy(() => import("./pages/Satellite"));
const Mandi            = lazy(() => import("./pages/Mandi"));

function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg)",
    }}>
      <div style={{
        width: 32, height: 32,
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public ── */}
              <Route path="/"      element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Google OAuth callback handler */}
              <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

              {/* ── Protected ── */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute><Chat /></ProtectedRoute>
              } />
              <Route path="/crops" element={
                <ProtectedRoute><Crops /></ProtectedRoute>
              } />
              <Route path="/plans" element={
                <ProtectedRoute><Plans /></ProtectedRoute>
              } />
              <Route path="/plans/:id" element={
                <ProtectedRoute><PlanDetail /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><Settings /></ProtectedRoute>
              } />
              <Route path="/disease" element={
                <ProtectedRoute><DiseaseDetection /></ProtectedRoute>
              } />
              <Route path="/yield" element={
                <ProtectedRoute><ProfitPlanner /></ProtectedRoute>
              } />
              <Route path="/intelligence" element={
                <ProtectedRoute><Intelligence /></ProtectedRoute>
              } />
              <Route path="/satellite" element={
                <ProtectedRoute><Satellite /></ProtectedRoute>
              } />
              <Route path="/mandi" element={
                <ProtectedRoute><Mandi /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
