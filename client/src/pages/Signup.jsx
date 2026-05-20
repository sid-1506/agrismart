import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faExclamationTriangle, faEye, faEyeSlash, faKey } from "@fortawesome/free-solid-svg-icons";
import LocationInput from "../components/LocationInput";

const C = {
  primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
  accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
  surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
  textLight: "#7A9080", white: "#FFFFFF", error: "#C0392B",
};

const LANGUAGES = ["English","Hindi","Marathi","Tamil","Telugu","Kannada","Bengali","Gujarati"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.bg}; font-family:'Outfit',sans-serif; color:${C.text}; overflow-x:hidden; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes grain {
    0%,100%{transform:translate(0,0);} 10%{transform:translate(-2%,-3%);} 20%{transform:translate(3%,2%);}
    30%{transform:translate(-1%,4%);} 40%{transform:translate(4%,-1%);} 50%{transform:translate(-3%,3%);}
    60%{transform:translate(2%,-4%);} 70%{transform:translate(-4%,1%);} 80%{transform:translate(1%,-2%);}
    90%{transform:translate(3%,3%);}
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .grain-overlay {
    position:absolute; inset:0; pointer-events:none; opacity:0.04; z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size:128px 128px; animation:grain 0.5s steps(1) infinite;
  }

  .form-card { animation: fadeUp 0.6s ease both; }

  .input-group { margin-bottom:16px; }
  .input-label { display:block; font-size:13px; font-weight:500; color:${C.textMuted}; margin-bottom:6px; }
  .input-field {
    width:100%; font-family:'Outfit',sans-serif; font-size:15px; color:${C.text};
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:11px 14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .input-field:focus { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.08); }
  .input-field::placeholder { color:#B0A898; }
  .input-field.err { border-color:${C.error}; }

  .select-field {
    width:100%; font-family:'Outfit',sans-serif; font-size:15px; color:${C.text};
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:11px 14px; outline:none; cursor:pointer;
    transition:border-color 0.2s,box-shadow 0.2s;
    appearance:none; -webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A9080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 14px center; padding-right:36px;
  }
  .select-field:focus { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.08); }

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

  .btn-google {
    width:100%; font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:${C.white}; color:${C.text}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:13px 16px; cursor:pointer; transition:border-color 0.2s,box-shadow 0.2s,transform 0.15s;
    display:flex; align-items:center; justify-content:center; gap:10px;
  }
  .btn-google:hover { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.06); transform:translateY(-1px); }

  .btn-switch {
    width:100%; font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:transparent; color:${C.primary}; border:1.5px solid ${C.accentLight};
    border-radius:8px; padding:13px 16px; cursor:pointer;
    transition:background 0.2s,border-color 0.2s,transform 0.15s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .btn-switch:hover { background:${C.accentLight}; border-color:${C.accent}; transform:translateY(-1px); }

  .btn-back {
    font-family:'Outfit',sans-serif; font-weight:500; font-size:15px; flex:1;
    background:transparent; color:${C.primary}; border:1.5px solid #D8D0C4;
    border-radius:8px; padding:13px; cursor:pointer; transition:border-color 0.2s;
    display:flex; align-items:center; justify-content:center;
  }
  .btn-back:hover { border-color:${C.primary}; }

  .spinner {
    width:18px; height:18px; border:2px solid rgba(247,243,237,0.3);
    border-top-color:${C.bg}; border-radius:50%; animation:spin 0.7s linear infinite;
  }

  .error-box {
    background:#FDF2F2; border:1px solid #F5C6C6; border-radius:8px;
    padding:10px 14px; margin-bottom:16px; font-size:13px; color:${C.error};
    display:flex; align-items:center; gap:8px;
  }
  .field-error { font-size:11px; color:${C.error}; margin-top:4px; }

  .divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
  .divider-line { flex:1; height:0.5px; background:#D8D0C4; }
  .divider-text { font-size:12px; color:${C.textLight}; white-space:nowrap; }

  /* Responsive */
  @media (max-width: 900px) {
    .panel-left  { width:35% !important; }
    .panel-right { width:65% !important; padding:36px 28px !important; }
  }
  @media (max-width: 600px) {
    .panel-left  { display:none !important; }
    .panel-right { width:100% !important; border-radius:0 !important;
                   min-height:100vh; padding:36px 24px !important; }
    .auth-wrap   { padding:0 !important; align-items:flex-start !important; }
    .show-mobile { display:flex !important; }
  }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.7 35.6 16.3 40 24 40v4z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 35.9 44 30.4 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

function PasswordStrength({ password }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (!password) return null;
  const colors = ["","#E74C3C","#E67E22","#F1C40F","#2ECC71","#1A4731"];
  const labels = ["","Weak","Fair","Good","Strong","Very Strong"];
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:"flex", gap:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2,
            background: i <= score ? colors[score] : "#E0D8CC", transition:"background 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize:11, marginTop:4, color:colors[score]||C.textLight }}>{labels[score]||"Too short"}</div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"", location:"", language:"English",
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2)    errs.name = "Name must be at least 2 characters.";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Please enter a valid email.";
    if (!form.password || form.password.length < 6)   errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)        errs.confirmPassword = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? ""}/api/auth/signup`,
        { name:form.name, email:form.email, password:form.password,
          location:form.location, language:form.language }
      );
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
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
          display:"flex", width:"100%", maxWidth:960, minHeight:620,
          borderRadius:20, overflow:"hidden",
          boxShadow:"0 24px 80px rgba(26,71,49,0.14)",
        }}>

          {/* ── Left panel ── */}
          <div className="panel-left" style={{
            width:"38%", background:C.primary, padding:"48px 36px",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
            position:"relative", overflow:"hidden",
          }}>
            <div className="grain-overlay" />
            <div style={{ position:"absolute", top:-50, left:-50, width:200, height:200,
              borderRadius:"50%", border:`1.5px solid rgba(200,151,58,0.2)`, pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-40, right:-40, width:180, height:180,
              borderRadius:"50%", border:`1px solid rgba(200,151,58,0.15)`, pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:2 }}>
              <Link to="/" style={{ display:"flex", alignItems:"center", gap:10,
                textDecoration:"none", marginBottom:52 }}>
                <div style={{ width:36, height:36, background:C.accent, borderRadius:9,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:C.white }}><FontAwesomeIcon icon={faLeaf} /></div>
                <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:C.bg }}>AgriSmart</span>
              </Link>

              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:C.bg,
                lineHeight:1.2, marginBottom:14 }}>
                Start your<br />farming journey.
              </h2>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:13,
                color:"rgba(247,243,237,0.65)", lineHeight:1.8, marginBottom:28 }}>
                Free forever. AI-powered. In your language.
              </p>

              {["AI chat for farming questions",
                "Personalised crop recommendations",
                "Step-by-step farming plans",
                "Timeline tracker for your crops"].map((f, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%",
                    background:"rgba(200,151,58,0.2)", border:`1px solid ${C.accent}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, color:C.accent, flexShrink:0 }}>✓</div>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300,
                    fontSize:13, color:"rgba(247,243,237,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ position:"relative", zIndex:2 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:11,
                color:"rgba(247,243,237,0.4)", fontStyle:"italic" }}>
                "AgriSmart helped me plan my Soybean crop perfectly."
              </div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:12,
                color:"rgba(247,243,237,0.55)", marginTop:6 }}>— Ramesh, Maharashtra</div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="panel-right form-card" style={{
            width:"62%", background:C.white, padding:"44px 48px",
            display:"flex", flexDirection:"column", justifyContent:"center",
            overflowY:"auto",
          }}>
            {/* Mobile logo */}
            <div className="show-mobile" style={{
              display:"none", alignItems:"center", gap:8, marginBottom:24,
            }}>
              <div style={{ width:32, height:32, background:C.primary, borderRadius:8,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:C.white }}><FontAwesomeIcon icon={faLeaf} /></div>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:C.primary }}>AgriSmart</span>
            </div>

            {/* Step indicator */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
              {[1,2].map(s => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background: s < step ? C.accent : s === step ? C.primary : C.surface,
                    color: s <= step ? C.bg : C.textLight,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:600, transition:"background 0.3s",
                  }}>
                    {s < step ? "✓" : s}
                  </div>
                  <span style={{ fontSize:12,
                    color: s === step ? C.primary : C.textLight,
                    fontWeight: s === step ? 500 : 400 }}>
                    {s === 1 ? "Account" : "Profile"}
                  </span>
                  {s < 2 && (
                    <div style={{ width:32, height:1.5, borderRadius:1,
                      background: step > 1 ? C.accent : "#D8D0C4", transition:"background 0.3s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Heading */}
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26,
                color:C.primary, marginBottom:4 }}>
                {step === 1 ? "Create your account" : "Tell us about yourself"}
              </h1>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:14, color:C.textLight }}>
                {step === 1
                  ? "Takes less than a minute"
                  : "Helps us personalise your recommendations"}
              </p>
            </div>

            {error && <div className="error-box"><FontAwesomeIcon icon={faExclamationTriangle} style={{marginRight:8}} />{error}</div>}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                {/* Google signup */}
                <button className="btn-google" onClick={handleGoogle} style={{ marginBottom:4 }}>
                  <GoogleIcon />
                  Sign up with Google
                </button>

                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">or sign up with email</span>
                  <div className="divider-line" />
                </div>

                <form onSubmit={handleNext}>
                  <div className="input-group">
                    <label className="input-label">Full name</label>
                    <input className={`input-field${fieldErrors.name?" err":""}`}
                      type="text" name="name" placeholder="Ramesh Kumar"
                      value={form.name} onChange={handleChange} autoComplete="name" />
                    {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email address</label>
                    <input className={`input-field${fieldErrors.email?" err":""}`}
                      type="email" name="email" placeholder="you@example.com"
                      value={form.email} onChange={handleChange} autoComplete="email" />
                    {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrap">
                      <input className={`input-field${fieldErrors.password?" err":""}`}
                        type={showPw?"text":"password"} name="password"
                        placeholder="Minimum 6 characters"
                        value={form.password} onChange={handleChange}
                        style={{ paddingRight:40 }} autoComplete="new-password" />
                      <button type="button" className="eye-btn" onClick={()=>setShowPw(p=>!p)}>
                        <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                    {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Confirm password</label>
                    <div className="input-wrap">
                      <input className={`input-field${fieldErrors.confirmPassword?" err":""}`}
                        type={showConfirm?"text":"password"} name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword} onChange={handleChange}
                        style={{ paddingRight:40 }} autoComplete="new-password" />
                      <button type="button" className="eye-btn" onClick={()=>setShowConfirm(p=>!p)}>
                        <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
                  </div>

                  <button type="submit" className="btn-primary">Continue →</button>
                </form>

                {/* Switch to Login */}
                <div className="divider" style={{ margin:"18px 0 14px" }}>
                  <div className="divider-line" />
                  <span className="divider-text">already have an account?</span>
                  <div className="divider-line" />
                </div>

                <button className="btn-switch" onClick={() => navigate("/login")}>
                  <FontAwesomeIcon icon={faKey} style={{marginRight:8}} /> Sign in to existing account
                </button>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Your location</label>
                  <LocationInput
                    value={form.location}
                    onChange={(v) => { setForm(f => ({ ...f, location: v })); setError(""); }}
                    placeholder="e.g. Pune, Maharashtra"
                    inputClass="input-field"
                    autoDetectOnMount
                  />
                  <div style={{ fontSize:11, color:C.textLight, marginTop:5 }}>
                    We auto-detect from your device — or search any city, village or pincode.
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Preferred language</label>
                  <select className="select-field" name="language"
                    value={form.language} onChange={handleChange}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Summary */}
                <div style={{ background:C.bg, borderRadius:10, padding:"14px 16px",
                  marginBottom:20, border:`0.5px solid ${C.accentLight}` }}>
                  <div style={{ fontSize:12, fontWeight:500, color:C.primary, marginBottom:8 }}>
                    Account summary
                  </div>
                  {[["Name",form.name],["Email",form.email],["Language",form.language]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between",
                      fontSize:12, marginBottom:4 }}>
                      <span style={{ color:C.textLight }}>{k}</span>
                      <span style={{ color:C.text, fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn-primary" disabled={loading}
                    style={{ flex:2, marginTop:0 }}>
                    {loading ? <><div className="spinner"/>Creating account...</> : "Create Account →"}
                  </button>
                </div>
              </form>
            )}

            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, color:C.textLight,
              textAlign:"center", marginTop:18, lineHeight:1.6 }}>
              By continuing you agree to our{" "}
              <Link to="/terms" style={{ color:C.accent, textDecoration:"none" }}>Terms</Link> and{" "}
              <Link to="/privacy" style={{ color:C.accent, textDecoration:"none" }}>Privacy Policy</Link>.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}