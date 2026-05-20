import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";
import LocationInput from "../components/LocationInput";
import { GEO_STATUS_KEY } from "../hooks/useLocation";
import useLocationStore, { useActiveLocation } from "../stores/useLocationStore";

const C = {
  primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
  accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
  surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
  textLight: "#7A9080", white: "#FFFFFF", error: "#C0392B",
  success: "#1A6B3C",
};

const API = import.meta.env.VITE_API_URL ?? "";

const LANGUAGES = [
  "English","Hindi","Marathi","Tamil","Telugu","Kannada","Bengali","Gujarati",
];

const styles = `
  ${layoutStyles}

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin    { to{transform:rotate(360deg);} }
  @keyframes pop     { 0%{transform:scale(0.8);opacity:0;}70%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }

  .page-pad { padding:18px 28px 56px; max-width:860px; margin:0 auto; }

  /* ── PROFILE HEADER CARD ── */
  .profile-hero {
    background:${C.primary}; border-radius:16px; padding:22px 28px;
    display:flex; align-items:center; gap:22px; flex-wrap:wrap;
    margin-bottom:18px; position:relative; overflow:hidden;
    animation:fadeUp 0.4s ease both;
  }
  .profile-hero::before {
    content:''; position:absolute; inset:0; pointer-events:none; opacity:0.04;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:160px;
  }
  .hero-inner { position:relative; z-index:1; display:flex; align-items:center; gap:20px; flex-wrap:wrap; width:100%; }
  .big-avatar {
    width:72px; height:72px; border-radius:18px;
    background:${C.accent}; color:${C.primaryDark};
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Serif Display',serif; font-size:28px; font-weight:700;
    flex-shrink:0;
  }
  .hero-info { flex:1; min-width:180px; }
  .hero-name  { font-family:'DM Serif Display',serif; font-size:22px; color:${C.bg}; margin-bottom:3px; }
  .hero-email { font-size:12.5px; color:rgba(247,243,237,0.6); margin-bottom:9px; }
  .hero-badges { display:flex; gap:8px; flex-wrap:wrap; }
  .hero-badge  {
    font-size:11px; font-weight:500; padding:4px 11px; border-radius:20px;
    display:flex; align-items:center; gap:5px;
  }
  .hero-stats { display:flex; gap:22px; flex-wrap:wrap; margin-left:auto; }
  .hero-stat  { text-align:center; }
  .hero-stat-val   { font-family:'DM Serif Display',serif; font-size:21px; color:${C.accent}; }
  .hero-stat-label { font-size:11px; color:rgba(247,243,237,0.5); margin-top:2px; }

  /* ── TABS ── */
  .tabs {
    display:flex; gap:0; background:${C.white};
    border:0.5px solid #E0D8CC; border-radius:12px;
    padding:4px; margin-bottom:16px;
    animation:fadeUp 0.4s 0.06s ease both;
    overflow-x:auto; flex-wrap:nowrap;
  }
  .tabs::-webkit-scrollbar { display:none; }
  .tab-btn {
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    padding:9px 18px; border:none; background:none; cursor:pointer;
    border-radius:9px; color:${C.textMuted}; white-space:nowrap;
    transition:background 0.18s,color 0.18s; display:flex; align-items:center; gap:7px;
    flex:1; justify-content:center;
  }
  .tab-btn:hover  { background:${C.bg}; color:${C.primary}; }
  .tab-btn.active { background:${C.primary}; color:${C.bg}; }
  .tab-btn.active i { color:${C.accent}; }

  /* ── SECTION CARD ── */
  .section-card {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:14px;
    margin-bottom:14px; overflow:hidden;
    animation:fadeUp 0.4s 0.1s ease both;
  }
  .section-head {
    padding:14px 20px; border-bottom:0.5px solid #F0EBE4;
    display:flex; align-items:center; justify-content:space-between;
  }
  .section-title { font-family:'DM Serif Display',serif; font-size:16px; color:${C.primary}; }
  .section-sub   { font-size:12px; color:${C.textLight}; margin-top:2px; }
  .section-body  { padding:20px; }

  /* ── FORM ── */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-group.full { grid-column:1/-1; }
  .form-label { font-size:13px; font-weight:500; color:${C.textMuted}; display:flex; align-items:center; gap:6px; }
  .form-label i { color:${C.accent}; font-size:12px; }
  .form-input {
    width:100%; font-family:'Outfit',sans-serif; font-size:14px; color:${C.text};
    background:${C.bg}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:10px 13px; outline:none; transition:border-color 0.2s,box-shadow 0.2s;
  }
  .form-input:focus { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.07); }
  .form-input::placeholder { color:#B0A898; }
  .form-input:disabled { opacity:0.55; cursor:not-allowed; }
  .form-select {
    width:100%; font-family:'Outfit',sans-serif; font-size:14px; color:${C.text};
    background:${C.bg}; border:1.5px solid #D8D0C4; border-radius:8px;
    padding:10px 13px; outline:none; cursor:pointer;
    appearance:none; -webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237A9080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 13px center; padding-right:34px;
    transition:border-color 0.2s,box-shadow 0.2s;
  }
  .form-select:focus { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.07); }

  /* ── BUTTONS ── */
  .btn-save {
    font-family:'Outfit',sans-serif; font-weight:600; font-size:14px;
    background:${C.primary}; color:${C.bg}; border:none; padding:11px 24px;
    border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:8px;
    transition:background 0.2s,transform 0.15s;
  }
  .btn-save:hover:not(:disabled) { background:${C.secondary}; transform:translateY(-1px); }
  .btn-save:disabled { opacity:0.65; cursor:not-allowed; }
  .btn-outline {
    font-family:'Outfit',sans-serif; font-weight:500; font-size:14px;
    background:transparent; color:${C.primary};
    border:1.5px solid ${C.accentLight}; padding:10px 20px;
    border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:7px;
    transition:background 0.2s,border-color 0.2s;
  }
  .btn-outline:hover { background:${C.accentLight}; border-color:${C.accent}; }
  .btn-danger {
    font-family:'Outfit',sans-serif; font-weight:600; font-size:14px;
    background:rgba(192,57,43,0.09); color:#C0392B;
    border:1.5px solid rgba(192,57,43,0.2); padding:10px 20px;
    border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:7px;
    transition:background 0.18s;
  }
  .btn-danger:hover { background:rgba(192,57,43,0.16); }

  /* ── TOAST ── */
  .toast {
    position:fixed; bottom:24px; right:24px; z-index:500;
    background:${C.primary}; color:${C.bg};
    padding:12px 20px; border-radius:10px;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    display:flex; align-items:center; gap:9px;
    box-shadow:0 8px 24px rgba(26,71,49,0.25);
    animation:pop 0.3s ease;
  }
  .toast.success { background:${C.primary}; }
  .toast.error   { background:#C0392B; }

  /* Password strength */
  .pw-strength { display:flex; gap:3px; margin-top:6px; }
  .pw-bar { flex:1; height:3px; border-radius:2px; transition:background 0.3s; }

  .spinner-sm { width:14px; height:14px; border:2px solid rgba(247,243,237,0.3);
    border-top-color:${C.bg}; border-radius:50%; animation:spin 0.7s linear infinite; }

  /* Responsive */
  @media(max-width:700px){
    .page-pad  { padding:14px 14px 88px!important; }
    .form-grid { grid-template-columns:1fr!important; }
    .form-group.full { grid-column:unset!important; }
    .profile-hero { padding:20px!important; flex-direction:column!important; align-items:flex-start!important; }
    .hero-stats { margin-left:0!important; }
    .section-body{ padding:16px!important; }
    .tabs { padding:3px!important; }
    .tab-btn { padding:8px 12px!important; font-size:12px!important; }
  }
`;

/* ── Toast ── */
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`toast ${type}`}>
      <i className={`fa-solid ${type==="success"?"fa-circle-check":"fa-circle-exclamation"}`} />
      {msg}
    </div>
  );
}

/* ── Password strength ── */
function PwStrength({ pw }) {
  if (!pw) return null;
  const score = [pw.length>=6,pw.length>=10,/[A-Z]/.test(pw),/[0-9]/.test(pw),/[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const cols = ["","#E74C3C","#E67E22","#F1C40F","#2ECC71","#1A4731"];
  const labels = ["","Weak","Fair","Good","Strong","Very Strong"];
  return (
    <div>
      <div className="pw-strength">
        {[1,2,3,4,5].map(i=>(
          <div key={i} className="pw-bar" style={{ background:i<=score?cols[score]:"#E0D8CC" }} />
        ))}
      </div>
      <div style={{ fontSize:11,marginTop:4,color:cols[score]||C.textLight }}>{labels[score]||"Too short"}</div>
    </div>
  );
}

const getInitials = (name="") => name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"U";

/* ═══════════════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tab,     setTab]     = useState("profile");
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);
  const [stats,   setStats]   = useState({ plans:0, steps:0, crops:0 });

  // Profile form
  const [profileForm, setProfileForm] = useState({ name:"", location:"", language:"English" });

  const activeLoc = useActiveLocation();
  const useLive   = useLocationStore((s) => s.useLive);
  const livePlace = useLocationStore((s) => s.livePlace);
  const setUseLive  = useLocationStore((s) => s.setUseLive);
  const refreshLive = useLocationStore((s) => s.refreshLive);
  const headerLocation = activeLoc?.display || user?.location || "Set your location";
  const isLiveActive = useLive && !!livePlace;

  // Password form
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [showPw, setShowPw] = useState({ current:false, newPw:false, confirm:false });
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const showToast = (msg, type="success") => setToast({ msg, type });

  /* Persist location immediately when user picks one (auto-detect or search) */
  const handleLocationPicked = async (place) => {
    if (!place || !place.display) return;
    // Mirror into the unified location store so the rest of the app
    // (weather, chat, mandi, intelligence, topbar) updates immediately.
    useLocationStore.getState().setCustom(place);
    try {
      const { data } = await axios.patch(`${API}/api/auth/profile`,
        { location: place.display },
        { headers:{ Authorization:`Bearer ${token}` } });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setProfileForm(p => ({ ...p, location: place.display }));
      showToast(`Location set to ${place.display}`);
    } catch {
      showToast("Could not save location", "error");
    }
  };

  const toggleLive = async () => {
    const next = !useLive;
    await setUseLive(next);
    showToast(next ? "Using live GPS location" : "Using saved location");
  };

  const refetchGps = async () => {
    const place = await refreshLive();
    if (place) showToast(`Live location: ${place.display}`);
    else       showToast("Could not detect location", "error");
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/auth/me`,
          { headers:{ Authorization:`Bearer ${token}` } });
        setUser(data.user);
        setProfileForm({
          name:     data.user.name     || "",
          location: data.user.location || "",
          language: data.user.language || "English",
        });

        // Plan stats
        const { data:planData } = await axios.get(`${API}/api/plans`,
          { headers:{ Authorization:`Bearer ${token}` } });
        const plans = planData.plans || [];
        const steps = plans.reduce((a,p)=>a+(p.timeline?.filter(s=>s.done).length||0),0);
        const crops = [...new Set(plans.map(p=>p.cropName))].length;
        setStats({ plans:plans.length, steps, crops });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* User has no location yet — should LocationInput auto-detect on mount? */
  const shouldAutoDetect =
    !loading && !!user && !user.location &&
    (typeof window === "undefined" ||
      localStorage.getItem(GEO_STATUS_KEY) !== "denied");

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { showToast("Name cannot be empty","error"); return; }
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/api/auth/update-profile`, profileForm,
        { headers:{ Authorization:`Bearer ${token}` } });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Profile saved successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save profile","error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwError("All fields are required."); return; }
    if (pwForm.newPw.length < 6)         { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.current === pwForm.newPw) { setPwError("New password must differ from current password."); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/api/auth/change-password`,
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { headers:{ Authorization:`Bearer ${token}` } });
      setPwForm({ current:"", newPw:"", confirm:"" });
      setPwSuccess("Password changed successfully. Use your new password next time you sign in.");
      showToast("Password updated");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const TABS = [
    { id:"profile",  icon:"fa-user", label:"Profile"  },
    { id:"security", icon:"fa-lock", label:"Security" },
    { id:"account",  icon:"fa-gear", label:"Account"  },
  ];

  if (loading) return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="profile">
        <div style={{ display:"flex",justifyContent:"center",padding:"80px 0" }}>
          <div style={{ width:28,height:28,border:"2.5px solid #E0D8CC",
            borderTopColor:C.primary,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
        </div>
      </AppLayout>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="profile">
        <div className="page-pad">

          {/* Profile hero */}
          <div className="profile-hero">
            <div className="hero-inner">
              <div className="big-avatar">{getInitials(user?.name)}</div>
              <div className="hero-info">
                <div className="hero-name">{user?.name}</div>
                <div className="hero-email">{user?.email}</div>
                <div className="hero-badges">
                  <span className="hero-badge"
                    title={isLiveActive ? "Live GPS location" : "Saved location"}
                    style={{ background:"rgba(200,151,58,0.2)",color:C.accent }}>
                    <i className={`fa-solid ${isLiveActive ? "fa-location-crosshairs" : "fa-location-dot"}`}
                       style={{ fontSize:10 }} />
                    {headerLocation}
                  </span>
                  {isLiveActive && (
                    <span className="hero-badge"
                      style={{ background:"rgba(46,204,113,0.18)",color:"#1ABC55",
                               display:"inline-flex",alignItems:"center",gap:5 }}
                      title="Updates as you move">
                      <span style={{ width:6,height:6,borderRadius:"50%",background:"#1ABC55",
                                     boxShadow:"0 0 0 0 rgba(26,188,85,0.7)",
                                     animation:"pulse 2s infinite" }} />
                      Live
                    </span>
                  )}
                  <span className="hero-badge" style={{ background:"rgba(255,255,255,0.1)",color:"rgba(247,243,237,0.7)" }}>
                    <i className="fa-solid fa-language" style={{ fontSize:10 }} />
                    {user?.language || "English"}
                  </span>
                </div>
              </div>
              <div className="hero-stats">
                {[
                  { val:stats.plans, label:"Plans" },
                  { val:stats.crops, label:"Crops" },
                  { val:stats.steps, label:"Steps Done" },
                ].map(({ val,label }) => (
                  <div key={label} className="hero-stat">
                    <div className="hero-stat-val">{val}</div>
                    <div className="hero-stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`}
                onClick={() => setTab(t.id)}>
                <i className={`fa-solid ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div className="section-card">
              <div className="section-head">
                <div>
                  <div className="section-title">Personal Information</div>
                  <div className="section-sub">Update your name, location and language preference</div>
                </div>
              </div>
              <div className="section-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fa-solid fa-user" /> Full name
                    </label>
                    <input className="form-input" type="text" placeholder="Your full name"
                      value={profileForm.name}
                      onChange={e => setProfileForm(p=>({...p,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fa-solid fa-envelope" /> Email address
                    </label>
                    <input className="form-input" type="email" value={user?.email || ""} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ justifyContent:"space-between" }}>
                      <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <i className="fa-solid fa-location-dot" /> Location
                        {isLiveActive && (
                          <span style={{ fontSize:10,fontWeight:600,color:"#1ABC55",
                                         display:"inline-flex",alignItems:"center",gap:4 }}>
                            <span style={{ width:6,height:6,borderRadius:"50%",background:"#1ABC55",
                                           animation:"pulse 2s infinite" }} />
                            LIVE
                          </span>
                        )}
                      </span>
                      <label style={{ display:"inline-flex",alignItems:"center",gap:8,
                                      cursor:"pointer",fontSize:12,fontWeight:500,color:C.textMuted }}>
                        <input type="checkbox" checked={useLive} onChange={toggleLive}
                          style={{ width:14,height:14,accentColor:C.primary,cursor:"pointer" }} />
                        Use Live GPS Location
                      </label>
                    </label>
                    <LocationInput
                      value={useLive ? (livePlace?.display || profileForm.location) : profileForm.location}
                      onChange={(v) => setProfileForm(p => ({ ...p, location: v }))}
                      onSelect={handleLocationPicked}
                      inputClass="form-input"
                      placeholder="e.g. Pune, Maharashtra or 411001"
                      autoDetectOnMount={shouldAutoDetect}
                      disabled={useLive}
                    />
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                                  fontSize:11,color:C.textLight,marginTop:4 }}>
                      <span>
                        {useLive
                          ? (livePlace ? "Auto-updating from your GPS." : "Detecting your location…")
                          : "Custom location — type a city or pincode."}
                      </span>
                      {useLive && (
                        <button type="button" onClick={refetchGps}
                          style={{ background:"none",border:"none",cursor:"pointer",
                                   color:C.primary,fontSize:11,fontWeight:600,
                                   display:"inline-flex",alignItems:"center",gap:4 }}>
                          <i className="fa-solid fa-rotate" /> Refresh
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fa-solid fa-language" /> Preferred language
                    </label>
                    <select className="form-select"
                      value={profileForm.language}
                      onChange={e => setProfileForm(p=>({...p,language:e.target.value}))}>
                      {LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop:20,display:"flex",gap:10,flexWrap:"wrap" }}>
                  <button className="btn-save" onClick={saveProfile} disabled={saving}>
                    {saving
                      ? <><div className="spinner-sm" /> Saving...</>
                      : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
                  </button>
                  <button className="btn-outline"
                    onClick={() => setProfileForm({name:user?.name||"",location:user?.location||"",language:user?.language||"English"})}>
                    <i className="fa-solid fa-rotate-left" /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === "security" && (
            <div className="section-card">
              <div className="section-head">
                <div>
                  <div className="section-title">Change Password</div>
                  <div className="section-sub">Use a strong password you don't reuse elsewhere</div>
                </div>
              </div>
              <div className="section-body">
                {pwError && (
                  <div style={{ background:"#FDF2F2",border:"1px solid #F5C6C6",borderRadius:8,
                    padding:"10px 14px",marginBottom:14,fontSize:13,color:C.error,
                    display:"flex",alignItems:"center",gap:8 }}>
                    <i className="fa-solid fa-circle-exclamation" /> {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ background:"#EFF7F1",border:`1px solid ${C.accentLight}`,borderRadius:8,
                    padding:"10px 14px",marginBottom:14,fontSize:13,color:C.success,
                    display:"flex",alignItems:"center",gap:8 }}>
                    <i className="fa-solid fa-circle-check" /> {pwSuccess}
                  </div>
                )}

                <div className="form-grid">
                  {[
                    { key:"current", label:"Current password",     ph:"Enter current password" },
                    { key:"newPw",   label:"New password",         ph:"Min 6 characters" },
                    { key:"confirm", label:"Confirm new password", ph:"Re-enter new password" },
                  ].map(({ key,label,ph }) => (
                    <div key={key} className="form-group" style={{ position:"relative" }}>
                      <label className="form-label">
                        <i className="fa-solid fa-lock" /> {label}
                      </label>
                      <div style={{ position:"relative" }}>
                        <input className="form-input"
                          type={showPw[key]?"text":"password"} placeholder={ph}
                          value={pwForm[key]}
                          onChange={e => { setPwForm(p=>({...p,[key]:e.target.value})); setPwError(""); setPwSuccess(""); }}
                          autoComplete={key==="current"?"current-password":"new-password"}
                          style={{ paddingRight:38 }} />
                        <button type="button"
                          onClick={() => setShowPw(p=>({...p,[key]:!p[key]}))}
                          style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                            background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:15 }}
                          tabIndex={-1}>
                          <i className={`fa-solid ${showPw[key]?"fa-eye-slash":"fa-eye"}`} />
                        </button>
                      </div>
                      {key==="newPw" && <PwStrength pw={pwForm.newPw} />}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:20 }}>
                  <button className="btn-save" onClick={changePassword} disabled={saving}>
                    {saving
                      ? <><div className="spinner-sm" /> Changing...</>
                      : <><i className="fa-solid fa-lock" /> Change Password</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ACCOUNT TAB ── */}
          {tab === "account" && (
            <div className="section-card">
              <div className="section-head">
                <div>
                  <div className="section-title">Account</div>
                  <div className="section-sub">Membership information and session</div>
                </div>
              </div>
              <div className="section-body">
                {[
                  { icon:"fa-id-badge",     label:"Account type",  val:"Free Plan" },
                  { icon:"fa-calendar",     label:"Member since",  val:user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "—" },
                  { icon:"fa-seedling",     label:"Plans created", val:stats.plans },
                  { icon:"fa-check-double", label:"Steps done",    val:stats.steps },
                ].map(({ icon,label,val }) => (
                  <div key={label} style={{ display:"flex",justifyContent:"space-between",
                    alignItems:"center",padding:"11px 0",borderBottom:"0.5px solid #F0EBE4" }}>
                    <span style={{ fontSize:14,color:C.textMuted,display:"flex",alignItems:"center",gap:8 }}>
                      <i className={`fa-solid ${icon}`} style={{ color:C.accent,fontSize:13 }} /> {label}
                    </span>
                    <span style={{ fontSize:14,fontWeight:600,color:C.primary }}>{val}</span>
                  </div>
                ))}

                <div style={{ marginTop:18,display:"flex",justifyContent:"flex-end" }}>
                  <button className="btn-danger" onClick={logout}>
                    <i className="fa-solid fa-right-from-bracket" /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </AppLayout>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
