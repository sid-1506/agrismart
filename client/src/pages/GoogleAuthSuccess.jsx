import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Processing your Google login...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const user   = params.get("user");

    if (!token || !user) {
      setStatus("Login failed — missing data. Redirecting to login...");
      setTimeout(() => navigate("/login?error=google_failed"), 2000);
      return;
    }

    try {
      const parsedUser = JSON.parse(decodeURIComponent(user));
      login(parsedUser, token);
      setStatus("Success! Taking you to your dashboard...");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch {
      setStatus("Something went wrong. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F3ED",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "#1A4731", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px", fontSize: 24,
        }}>
          <i className="fa-solid fa-wheat-awn" style={{ color: "#C8973A" }} />
        </div>
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22, color: "#1A4731", marginBottom: 10,
        }}>
          AgriSmart
        </div>
        <div style={{ fontSize: 14, color: "#7A9080", marginBottom: 20 }}>
          {status}
        </div>
        <div style={{
          width: 32, height: 32, border: "3px solid #E0D8CC",
          borderTopColor: "#1A4731", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );
}
