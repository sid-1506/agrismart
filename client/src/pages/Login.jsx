import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faExclamationTriangle, faEye, faEyeSlash, faSprout } from "@fortawesome/free-solid-svg-icons";

const C = {
  primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
  accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
  surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
  textLight: "#7A9080", white: "#FFFFFF", error: "#C0392B",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'Outfit', sans-serif; color: ${C.text}; overflow-x:hidden; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes grain {
    0%,100%{transform:translate(0,0);} 10%{transform:translate(-2%,-3%);} 20%{transform:translate(3%,2%);}
    30%{transform:translate(-1%,4%);} 40%{transform:translate(4%,-1%);} 50%{transform:translate(-3%,3%);}
    60%{transform:translate(2%,-4%);} 70%{transform:translate(-4%,1%);} 80%{transform:translate(1%,-2%);}
    90%{transform:translate(3%,3%);}
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .grain-overlay {
    position:absolute; inset:0; pointer-events:none; opacity:0.04; z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size:128px 128px; animation:grain 0.5s steps(1) infinite;
  }

  .form-card { animation: fadeUp 0.6s ease both; }

  .input-group { margin-bottom: 18px; }
  .input-label { display:block; font-size:13px; font-weight:500; color:${C.textMuted}; margin-bottom:6px; }
  .input-field {
    width:100%; font-family:'Outfit',sans-serif; font-size:15px; color:${C.text};
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:11px 14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .input-field:focus { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.08); }
  .input-field::placeholder { color:#B0A898; }
  .input-field.err { border-color:${C.error}; }

  .input-wrap { position:relative; }
  .eye-btn {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:${C.textLight};
    font-size:16px; display:flex; align-items:center; padding:4px;
  }

  .btn-primary {
    width:100%; font-family:'Outfit',sans-serif; font-weight:600; font-size:16px;
    background:${C.primary}; color:${C.bg}; border:none; padding:14px; border-radius:8px;
    cursor:pointer; transition:background 0.2s,transform 0.15s; margin-top:4px;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .btn-primary:hover:not(:disabled) { background:${C.secondary}; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }

  /* Google button */
  .btn-google {
    width:100%; font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:${C.white}; color:${C.text}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:13px 16px; cursor:pointer; transition:border-color 0.2s,box-shadow 0.2s,transform 0.15s;
    display:flex; align-items:center; justify-content:center; gap:10px;
  }
  .btn-google:hover { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.06); transform:translateY(-1px); }

  /* Switch auth button */
  .btn-switch {
    width:100%; font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:transparent; color:${C.primary}; border:1.5px solid ${C.accentLight};
    border-radius:8px; padding:13px 16px; cursor:pointer;
    transition:background 0.2s,border-color 0.2s,transform 0.15s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .btn-switch:hover { background:${C.accentLight}; border-color:${C.accent}; transform:translateY(-1px); }

  .spinner {
    width:18px; height:18px; border:2px solid rgba(247,243,237,0.3);
    border-top-color:${C.bg}; border-radius:50%; animation:spin 0.7s linear infinite;
  }

  .error-box {
    background:#FDF2F2; border:1px solid #F5C6C6; border-radius:8px;
    padding:10px 14px; margin-bottom:16px; font-size:13px; color:${C.error};
    display:flex; align-items:center; gap:8px;
  }

  .divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
  .divider-line { flex:1; height:0.5px; background:#D8D0C4; }
  .divider-text { font-size:12px; color:${C.textLight}; white-space:nowrap; }

  /* Responsive */
  @media (max-width: 900px) {
    .panel-left  { width:38% !important; }
    .panel-right { width:62% !important; padding:40px 32px !important; }
  }
  @media (max-width: 600px) {
    .panel-left  { display:none !important; }
    .panel-right { width:100% !important; border-radius:0 !important;
                   min-height:100vh; padding:40px 24px !important; }
    .auth-wrap   { padding:0 !important; align-items:flex-start !important; }
    .show-mobile { display:flex !important; }
  }
`;

// Google SVG icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.7 35.6 16.3 40 24 40v4z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 35.9 44 30.4 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? ""}/api/auth/login`, form
      );
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // Google OAuth — wire up your backend OAuth endpoint here
    window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/api/auth/google`;
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-wrap" style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:C.bg, padding:"20px",
      }}>
        <div style={{
          display:"flex", width:"100%", maxWidth:920, minHeight:580,
          borderRadius:20, overflow:"hidden",
          boxShadow:"0 24px 80px rgba(26,71,49,0.14)",
        }}>

          {/* ── Left branding panel ── */}
          <div className="panel-left" style={{
            width:"44%", background:C.primary, padding:"48px 40px",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
            position:"relative", overflow:"hidden",
          }}>
            <div className="grain-overlay" />
            <div style={{ position:"absolute", bottom:-60, right:-60, width:220, height:220,
              borderRadius:"50%", border:`1.5px solid rgba(200,151,58,0.25)`, pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:20, right:20, width:130, height:130,
              borderRadius:"50%", border:`1px solid rgba(200,151,58,0.15)`, pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:2 }}>
              <Link to="/" style={{ display:"flex", alignItems:"center", gap:10,
                textDecoration:"none", marginBottom:56 }}>
                <div style={{ width:36, height:36, background:C.accent, borderRadius:9,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#FFFFFF" }}><FontAwesomeIcon icon={faLeaf} /></div>
                <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:C.bg }}>AgriSmart</span>
              </Link>

              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, color:C.bg,
                lineHeight:1.2, marginBottom:16 }}>
                Welcome<br />back, Farmer.
              </h2>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:14,
                color:"rgba(247,243,237,0.65)", lineHeight:1.8 }}>
                Your crops are waiting. Log in to track your farming plans and get AI-powered guidance.
              </p>
            </div>

            <div style={{ position:"relative", zIndex:2, display:"flex", gap:28 }}>
              {[["500+","Crops"],["12+","Languages"],["AI","Powered"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:C.accent }}>{v}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:11,
                    color:"rgba(247,243,237,0.5)", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="panel-right form-card" style={{
            width:"56%", background:C.white, padding:"48px 44px",
            display:"flex", flexDirection:"column", justifyContent:"center",
          }}>
            {/* Mobile logo — shown only when left panel hidden */}
            <div className="show-mobile" style={{
              display:"none", alignItems:"center", gap:8, marginBottom:28,
            }}>
              <div style={{ width:32, height:32, background:C.primary, borderRadius:8,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#FFFFFF" }}><FontAwesomeIcon icon={faLeaf} /></div>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:C.primary }}>AgriSmart</span>
            </div>

            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28,
                color:C.primary, marginBottom:6 }}>Sign in</h1>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300,
                fontSize:14, color:C.textLight }}>
                Access your farming dashboard
              </p>
            </div>

            {error && <div className="error-box"><FontAwesomeIcon icon={faExclamationTriangle} style={{marginRight:8}} />{error}</div>}

            {/* Google button */}
            <button className="btn-google" onClick={handleGoogle} style={{ marginBottom:4 }}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign in with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email address</label>
                <input className={`input-field${error ? " err" : ""}`}
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} autoComplete="email" />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Password</span>
                  <Link to="/forgot-password" style={{ color:C.accent, fontSize:12,
                    fontWeight:500, textDecoration:"none" }}>Forgot password?</Link>
                </label>
                <div className="input-wrap">
                  <input className={`input-field${error ? " err" : ""}`}
                    type={showPw ? "text" : "password"} name="password"
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange}
                    style={{ paddingRight:40 }} autoComplete="current-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPw(p => !p)}>
                    <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" />Signing in...</> : "Sign In →"}
              </button>
            </form>

            {/* Switch to Signup */}
            <div className="divider" style={{ margin:"20px 0 16px" }}>
              <div className="divider-line" />
              <span className="divider-text">new to AgriSmart?</span>
              <div className="divider-line" />
            </div>

            <button className="btn-switch" onClick={() => navigate("/signup")}>
              <FontAwesomeIcon icon={faSprout} style={{marginRight:8}} /> Create a free account
            </button>

            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, color:C.textLight,
              textAlign:"center", marginTop:20, lineHeight:1.6 }}>
              By signing in you agree to our{" "}
              <Link to="/terms" style={{ color:C.accent, textDecoration:"none" }}>Terms</Link> and{" "}
              <Link to="/privacy" style={{ color:C.accent, textDecoration:"none" }}>Privacy Policy</Link>.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}