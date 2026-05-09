// import { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";

// const C = {
//   primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
//   accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
//   surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
//   textLight: "#7A9080", white: "#FFFFFF",
// };

// const SIDEBAR_W = 240;

// export const layoutStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&display=swap');
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   html, body { height: 100%; overflow: hidden; }
//   body { background: ${C.bg}; font-family: 'Outfit', sans-serif; color: ${C.text}; }

//   @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
//   @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
//   @keyframes spin    { to { transform: rotate(360deg); } }
//   @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
//   @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
//   @keyframes typing  { 0%,80%,100% { transform: scale(0.55); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

//   /* ── LAYOUT SHELL ── */
//   .app-shell { display: flex; height: 100vh; overflow: hidden; }

//   /* ── SIDEBAR ── */
//   .sidebar {
//     width: ${SIDEBAR_W}px;
//     background: ${C.primary};
//     flex-shrink: 0;
//     display: flex;
//     flex-direction: column;
//     height: 100vh;
//     overflow: hidden;           /* ← kills the inner scroll */
//     position: relative;
//     z-index: 50;
//     /* NO grain animation — that was causing the green flicker */
//     will-change: unset;
//   }

//   /* Subtle static texture — no animation */
//   .sidebar::before {
//     content: '';
//     position: absolute;
//     inset: 0;
//     background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
//     background-size: 160px;
//     opacity: 0.035;
//     pointer-events: none;
//     z-index: 0;
//   }

//   .sidebar-inner {
//     position: relative;
//     z-index: 1;
//     display: flex;
//     flex-direction: column;
//     height: 100%;
//     overflow: hidden;           /* ← belt + suspenders: no scroll anywhere in sidebar */
//   }

//   .sidebar-logo {
//     padding: 26px 22px 18px;
//     border-bottom: 0.5px solid rgba(255,255,255,0.08);
//     flex-shrink: 0;
//   }

//   .sidebar-logo a {
//     display: flex; align-items: center; gap: 10px; text-decoration: none;
//   }

//   .sidebar-logo-icon {
//     width: 34px; height: 34px; background: ${C.accent}; border-radius: 8px;
//     display: flex; align-items: center; justify-content: center;
//     color: ${C.primaryDark}; font-size: 15px; flex-shrink: 0;
//   }

//   .sidebar-nav {
//     flex: 1;
//     padding: 14px 10px;
//     display: flex;
//     flex-direction: column;
//     gap: 2px;
//     overflow: hidden;           /* ← no nav scroll */
//   }

//   .nav-section {
//     font-family: 'Outfit', sans-serif;
//     font-size: 10px; font-weight: 600;
//     letter-spacing: 0.1em; text-transform: uppercase;
//     color: rgba(247,243,237,0.28);
//     padding: 12px 12px 5px;
//   }

//   .nav-item {
//     display: flex; align-items: center; gap: 11px;
//     padding: 9px 12px; border-radius: 9px; cursor: pointer;
//     text-decoration: none; border: none; background: none; width: 100%;
//     font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500;
//     color: rgba(247,243,237,0.6);
//     transition: background 0.16s, color 0.16s;
//     text-align: left;
//   }
//   .nav-item:hover  { background: rgba(255,255,255,0.09); color: ${C.bg}; }
//   .nav-item.active { background: rgba(200,151,58,0.2);   color: ${C.accent}; }
//   .nav-item i      { width: 18px; text-align: center; font-size: 14px; flex-shrink: 0; }

//   .sidebar-footer {
//     padding: 12px 10px 22px;
//     border-top: 0.5px solid rgba(255,255,255,0.08);
//     flex-shrink: 0;
//   }

//   .logout-btn {
//     display: flex; align-items: center; gap: 11px; padding: 9px 12px;
//     border-radius: 9px; cursor: pointer; width: 100%; border: none; background: none;
//     font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500;
//     color: rgba(247,243,237,0.45); transition: background 0.16s, color 0.16s;
//     text-align: left;
//   }
//   .logout-btn:hover { background: rgba(192,57,43,0.18); color: #E57373; }
//   .logout-btn i { width: 18px; text-align: center; font-size: 14px; }

//   /* ── MAIN AREA ── */
//   .main-area {
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     min-width: 0;
//     height: 100vh;
//     overflow: hidden;
//   }

//   /* ── TOPBAR ── */
//   .topbar {
//     height: 62px;
//     background: ${C.white};
//     border-bottom: 0.5px solid #E0D8CC;
//     padding: 0 26px;
//     display: flex; align-items: center; justify-content: space-between;
//     flex-shrink: 0;
//     z-index: 40;
//   }

//   .topbar-left { display: flex; align-items: center; gap: 14px; }
//   .topbar-right { display: flex; align-items: center; gap: 10px; }

//   .hamburger {
//     display: none; background: none; border: none; cursor: pointer;
//     flex-direction: column; gap: 5px; padding: 4px;
//   }
//   .hamburger span {
//     display: block; width: 20px; height: 2px;
//     background: ${C.primary}; border-radius: 2px;
//     transition: transform 0.25s, opacity 0.25s;
//   }

//   .search-wrap {
//     display: flex; align-items: center; gap: 8px;
//     background: ${C.bg}; border: 1.5px solid #E0D8CC; border-radius: 8px;
//     padding: 7px 13px; transition: border-color 0.2s;
//   }
//   .search-wrap:focus-within { border-color: ${C.primary}; }
//   .search-wrap i   { color: ${C.textLight}; font-size: 13px; }
//   .search-wrap input {
//     background: none; border: none; outline: none;
//     font-family: 'Outfit', sans-serif; font-size: 14px; color: ${C.text}; width: 190px;
//   }
//   .search-wrap input::placeholder { color: ${C.textLight}; }

//   .icon-btn {
//     width: 36px; height: 36px; border-radius: 8px;
//     border: 1.5px solid #E0D8CC; background: none; cursor: pointer;
//     display: flex; align-items: center; justify-content: center;
//     color: ${C.textMuted}; font-size: 14px;
//     transition: border-color 0.2s, color 0.2s;
//   }
//   .icon-btn:hover { border-color: ${C.primary}; color: ${C.primary}; }

//   .avatar {
//     width: 36px; height: 36px; border-radius: 50%;
//     background: ${C.primary}; color: ${C.bg};
//     display: flex; align-items: center; justify-content: center;
//     font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
//     cursor: pointer; flex-shrink: 0;
//   }

//   .user-meta { display: flex; flex-direction: column; }
//   .user-name { font-family: 'Outfit',sans-serif; font-size: 13px; font-weight: 500; color: ${C.text}; }
//   .user-loc  { font-family: 'Outfit',sans-serif; font-size: 11px; color: ${C.textLight}; }

//   /* ── PAGE SCROLL AREA ── */
//   .page-scroll {
//     flex: 1;
//     overflow-y: auto;
//     overflow-x: hidden;
//   }
//   /* nice thin scrollbar on the content area only */
//   .page-scroll::-webkit-scrollbar { width: 5px; }
//   .page-scroll::-webkit-scrollbar-track { background: transparent; }
//   .page-scroll::-webkit-scrollbar-thumb { background: #D8D0C4; border-radius: 4px; }
//   .page-scroll::-webkit-scrollbar-thumb:hover { background: #C0B8B0; }

//   /* ── MOBILE OVERLAY ── */
//   .mob-overlay {
//     display: none; position: fixed; inset: 0;
//     background: rgba(0,0,0,0.42); z-index: 49;
//     animation: fadeIn 0.2s ease;
//   }
//   .mob-overlay.show { display: block; }

//   /* ── BOTTOM NAV ── */
//   .bottom-nav {
//     display: none; position: fixed; bottom: 0; left: 0; right: 0;
//     background: ${C.white}; border-top: 0.5px solid #E0D8CC;
//     padding: 6px 0 max(6px, env(safe-area-inset-bottom));
//     z-index: 60;
//   }
//   .bottom-nav-row { display: flex; justify-content: space-around; }
//   .bn-btn {
//     display: flex; flex-direction: column; align-items: center; gap: 3px;
//     padding: 5px 10px; background: none; border: none; cursor: pointer;
//     font-family: 'Outfit',sans-serif; font-size: 10px; font-weight: 500;
//     color: ${C.textLight}; transition: color 0.15s;
//   }
//   .bn-btn.active { color: ${C.primary}; }
//   .bn-btn i { font-size: 18px; }

//   /* ── RESPONSIVE ── */
//   @media (max-width: 700px) {
//     .sidebar {
//       position: fixed; top: 0; left: 0;
//       transform: translateX(-100%);
//       transition: transform 0.28s ease;
//       z-index: 50;
//     }
//     .sidebar.mob-open { transform: translateX(0); }
//     .main-area { margin-left: 0 !important; }
//     .hamburger { display: flex !important; }
//     .search-wrap { display: none !important; }
//     .user-meta  { display: none !important; }
//     .bottom-nav { display: block; }
//     .topbar { padding: 0 16px; }
//   }
// `;

// const getInitials = (name = "") =>
//   name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

// const NAV = [
//   { id: "dashboard", icon: "fa-house",           label: "Dashboard", path: "/dashboard" },
//   { id: "chat",      icon: "fa-comments",         label: "AI Chat",   path: "/chat"      },
//   { id: "crops",     icon: "fa-seedling",         label: "Crops",     path: "/crops"     },
//   { id: "plans",     icon: "fa-clipboard-list",   label: "My Plans",  path: "/plans"     },
//   { id: "timeline",  icon: "fa-timeline",         label: "Timeline",  path: "/plans"     },
// ];
// const NAV2 = [
//   { id: "profile",  icon: "fa-user",  label: "Profile",  path: "/profile"  },
//   { id: "settings", icon: "fa-gear",  label: "Settings", path: "/settings" },
// ];
// const BOT_NAV = [
//   { id: "dashboard", icon: "fa-house",         label: "Home"   },
//   { id: "chat",      icon: "fa-comments",      label: "Chat"   },
//   { id: "crops",     icon: "fa-seedling",      label: "Crops"  },
//   { id: "plans",     icon: "fa-clipboard-list",label: "Plans"  },
//   { id: "profile",   icon: "fa-user",          label: "Profile"},
// ];

// export function AppLayout({ children, pageId }) {
//   const navigate    = useNavigate();
//   const location    = useLocation();
//   const [mob, setMob] = useState(false);
//   const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

//   const active = pageId || NAV.find(n => location.pathname.startsWith(n.path))?.id || "dashboard";

//   const goTo = (path) => { setMob(false); navigate(path); };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <div className="app-shell">
//       {/* Mobile overlay */}
//       <div className={`mob-overlay${mob ? " show" : ""}`} onClick={() => setMob(false)} />

//       {/* ── Sidebar ── */}
//       <aside className={`sidebar${mob ? " mob-open" : ""}`}>
//         <div className="sidebar-inner">
//           <div className="sidebar-logo">
//             <Link to="/">
//               <div className="sidebar-logo-icon">
//                 <i className="fa-solid fa-wheat-awn" />
//               </div>
//               <span style={{ fontFamily:"'DM Serif Display',serif", fontSize: 19, color: C.bg }}>
//                 AgriSmart
//               </span>
//             </Link>
//           </div>

//           <nav className="sidebar-nav">
//             <div className="nav-section">Main Menu</div>
//             {NAV.map(n => (
//               <button key={n.id} className={`nav-item${active === n.id ? " active" : ""}`}
//                 onClick={() => goTo(n.path)}>
//                 <i className={`fa-solid ${n.icon}`} />
//                 {n.label}
//               </button>
//             ))}
//             <div className="nav-section" style={{ marginTop: 6 }}>Account</div>
//             {NAV2.map(n => (
//               <button key={n.id} className={`nav-item${active === n.id ? " active" : ""}`}
//                 onClick={() => goTo(n.path)}>
//                 <i className={`fa-solid ${n.icon}`} />
//                 {n.label}
//               </button>
//             ))}
//           </nav>

//           <div className="sidebar-footer">
//             <button className="logout-btn" onClick={logout}>
//               <i className="fa-solid fa-right-from-bracket" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ── Main ── */}
//       <div className="main-area">
//         {/* Topbar */}
//         <header className="topbar">
//           <div className="topbar-left">
//             <button className="hamburger" onClick={() => setMob(o => !o)} aria-label="Menu">
//               <span style={{ transform: mob ? "rotate(45deg) translate(5px,5px)" : "none" }} />
//               <span style={{ opacity: mob ? 0 : 1 }} />
//               <span style={{ transform: mob ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
//             </button>
//             <div className="search-wrap">
//               <i className="fa-solid fa-magnifying-glass" />
//               <input placeholder="Search crops, plans..." />
//             </div>
//           </div>
//           <div className="topbar-right">
//             <button className="icon-btn" title="Notifications">
//               <i className="fa-solid fa-bell" />
//             </button>
//             <div className="avatar">{getInitials(user?.name)}</div>
//             <div className="user-meta">
//               <span className="user-name">{user?.name?.split(" ")[0] || "Farmer"}</span>
//               <span className="user-loc">{user?.location || "India"}</span>
//             </div>
//           </div>
//         </header>

//         {/* Scrollable page area */}
//         <div className="page-scroll">
//           {children}
//         </div>
//       </div>

//       {/* Mobile bottom nav */}
//       <nav className="bottom-nav">
//         <div className="bottom-nav-row">
//           {BOT_NAV.map(n => (
//             <button key={n.id} className={`bn-btn${active === n.id ? " active" : ""}`}
//               onClick={() => goTo(NAV.find(x => x.id === n.id)?.path || "/dashboard")}>
//               <i className={`fa-solid ${n.icon}`} />
//               {n.label}
//             </button>
//           ))}
//         </div>
//       </nav>
//     </div>
//   );
// }
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../stores/useAuthStore";
import { useActiveLocation } from "../stores/useLocationStore";
import useLocationStore from "../stores/useLocationStore";
import BottomNav from "./BottomNav";

export const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&display=swap');

  :root {
    --bg:#F7F3ED; --bg-secondary:#EDE8E0; --surface:#E2DDD5; --card:#FFFFFF;
    --sidebar:#1A4731; --sidebar-dark:#0D2A1F; --sidebar-text:#F7F3ED;
    --primary:#1A4731; --primary-hover:#2E6B49;
    --accent:#C8973A; --accent-light:#E8D5B4;
    --text:#1A1A16; --text-muted:#4A5E50; --text-light:#7A9080;
    --border:#E0D8CC; --border-light:#EDE8E0;
    --input-bg:#F7F3ED; --topbar-bg:#FFFFFF;
    --shadow:rgba(26,71,49,0.10); --shadow-hover:rgba(26,71,49,0.18);
    --nav-active-bg:rgba(200,151,58,0.18); --nav-active-c:#C8973A;
    --radius-xl:32px; --radius-lg:24px; --radius-md:16px; --radius-sm:12px;
    --card-shadow: 0 2px 8px rgba(26,71,49,0.08), 0 8px 32px rgba(26,71,49,0.05);
    --card-shadow-hover: 0 8px 28px rgba(26,71,49,0.14), 0 16px 48px rgba(26,71,49,0.08);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;overflow:hidden;}
  body{
    background:var(--bg); font-family:'Outfit',sans-serif; color:var(--text);
    transition:background 0.35s,color 0.35s;
  }

  @keyframes fadeIn  {from{opacity:0;}to{opacity:1;}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideUp {from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin    {to{transform:rotate(360deg);}}
  @keyframes pulse   {0%,100%{opacity:1;}50%{opacity:0.4;}}
  @keyframes slideIn {from{transform:translateX(-100%);}to{transform:translateX(0);}}
  @keyframes typing  {0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-5px);}}
  @keyframes floatAnim {0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
  @keyframes scaleIn {from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}

  /* scroll-reveal */
  .reveal{opacity:0;transform:translateY(22px);transition:opacity 0.5s ease,transform 0.5s ease;}
  .reveal.in-view{opacity:1;transform:translateY(0);}
  @media(prefers-reduced-motion:reduce){
    .reveal{opacity:1!important;transform:none!important;transition:none!important;}
    *{animation-duration:0.001ms!important;transition-duration:0.001ms!important;}
  }

  .app-shell{display:flex;height:100vh;overflow:hidden;}

  /* SIDEBAR */
  .sidebar{
    width:248px; background:var(--sidebar); flex-shrink:0;
    display:flex; flex-direction:column; height:100vh;
    overflow:hidden; position:relative; z-index:50;
    transition:background 0.35s,transform 0.28s ease;
    box-shadow:4px 0 24px rgba(0,0,0,0.08);
  }
  .sidebar::before{
    content:'';position:absolute;inset:0;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:160px;opacity:0.035;z-index:0;
  }
  .sidebar-inner{position:relative;z-index:1;display:flex;flex-direction:column;height:100%;overflow:hidden;}
  .sidebar-logo{padding:28px 22px 20px;border-bottom:0.5px solid rgba(255,255,255,0.08);flex-shrink:0;}
  .sidebar-logo a{display:flex;align-items:center;gap:12px;text-decoration:none;}
  .sidebar-logo-icon{
    width:38px;height:38px;background:var(--accent);border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    color:var(--sidebar-dark);font-size:16px;flex-shrink:0;transition:background 0.35s;
    box-shadow:0 4px 12px rgba(200,151,58,0.35);
  }
  .sidebar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;overflow-x:hidden;}
  .sidebar-nav::-webkit-scrollbar{width:3px;}
  .sidebar-nav::-webkit-scrollbar-track{background:transparent;}
  .sidebar-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px;}
  .nav-section{
    font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
    color:rgba(255,255,255,0.25);padding:14px 12px 6px;
  }
  .nav-item{
    display:flex;align-items:center;gap:12px;padding:10px 14px;
    border-radius:12px;cursor:pointer;text-decoration:none;
    border:none;background:none;width:100%;font-family:'Outfit',sans-serif;
    font-size:14px;font-weight:500;color:rgba(255,255,255,0.55);
    transition:background 0.18s,color 0.18s,transform 0.15s;text-align:left;
  }
  .nav-item:hover  {background:rgba(255,255,255,0.1);color:var(--sidebar-text);transform:translateX(2px);}
  .nav-item.active {background:var(--nav-active-bg);color:var(--nav-active-c);}
  .nav-item i{width:18px;text-align:center;font-size:14px;flex-shrink:0;}
  .sidebar-footer{padding:14px 12px 24px;border-top:0.5px solid rgba(255,255,255,0.08);flex-shrink:0;}
  .logout-btn{
    display:flex;align-items:center;gap:12px;padding:10px 14px;
    border-radius:12px;cursor:pointer;width:100%;border:none;background:none;
    font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;
    color:rgba(255,255,255,0.42);transition:background 0.18s,color 0.18s;text-align:left;
  }
  .logout-btn:hover{background:rgba(192,57,43,0.18);color:#E57373;}
  .logout-btn i{width:18px;text-align:center;font-size:14px;}

  /* MAIN */
  .main-area{
    flex:1;display:flex;flex-direction:column;min-width:0;height:100vh;
    overflow:hidden;background:var(--bg);transition:background 0.35s;
  }

  /* TOPBAR */
  .topbar{
    height:64px;background:var(--topbar-bg);border-bottom:0.5px solid var(--border);
    padding:0 28px;display:flex;align-items:center;justify-content:space-between;
    flex-shrink:0;z-index:40;transition:background 0.35s,border-color 0.35s;
  }
  .topbar-left{display:flex;align-items:center;gap:14px;}
  .topbar-right{display:flex;align-items:center;gap:10px;}

  .hamburger{display:none;background:none;border:none;cursor:pointer;flex-direction:column;gap:5px;padding:4px;}
  .hamburger span{display:block;width:22px;height:2px;background:var(--primary);border-radius:2px;transition:transform 0.25s,opacity 0.25s;}

  .avatar{
    width:38px;height:38px;border-radius:50%;background:var(--primary);color:var(--sidebar-text);
    display:flex;align-items:center;justify-content:center;
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;
    box-shadow:0 2px 8px rgba(26,71,49,0.3);
  }
  .user-name{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text);}
  .user-loc {
    font-family:'Outfit',sans-serif;font-size:11px;color:var(--text-light);
    display:flex;align-items:center;gap:5px;max-width:160px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .user-loc i{font-size:10px;color:var(--accent);flex-shrink:0;}

  .page-scroll{flex:1;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth;}
  .page-scroll::-webkit-scrollbar{width:4px;}
  .page-scroll::-webkit-scrollbar-track{background:transparent;}
  .page-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}

  /* MOBILE */
  .mob-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.48);z-index:49;animation:fadeIn 0.2s;backdrop-filter:blur(4px);}
  .mob-overlay.show{display:block;}

  @media(max-width:768px){
    .sidebar{position:fixed;top:0;left:0;transform:translateX(-100%);}
    .sidebar.mob-open{transform:translateX(0);}
    .main-area{margin-left:0!important;}
    .hamburger{display:flex!important;}
    .user-meta{display:none!important;}
    .topbar{padding:0 18px;}
    .page-scroll{padding-bottom:80px;}
  }
`;

const getInitials = (n="") => n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"U";

const NAV = [
  {id:"dashboard",   icon:"fa-house",          tKey:"nav.dashboard",     path:"/dashboard"},
  {id:"chat",        icon:"fa-comments",        tKey:"nav.chat",          path:"/chat"},
  {id:"intelligence",icon:"fa-satellite-dish",  tKey:"nav.intelligence",  path:"/intelligence"},
  {id:"satellite",   icon:"fa-satellite",       tKey:"nav.satellite",     path:"/satellite"},
  {id:"mandi",       icon:"fa-chart-line",      tKey:"nav.mandi",         path:"/mandi"},
  {id:"crops",       icon:"fa-seedling",        tKey:"nav.crops",         path:"/crops"},
  {id:"plans",       icon:"fa-clipboard-list",  tKey:"nav.plans",         path:"/plans"},
  {id:"disease",     icon:"fa-microscope",      tKey:"nav.disease",       path:"/disease"},
  {id:"yield",       icon:"fa-calculator",      tKey:"nav.profitPlanner", path:"/yield"},
];
const NAV2 = [
  {id:"profile", icon:"fa-user", tKey:"nav.profile", path:"/profile"},
  {id:"settings",icon:"fa-gear", tKey:"nav.settings",path:"/settings"},
];
const BOT=[
  {id:"dashboard",icon:"fa-house",         tKey:"nav.home"},
  {id:"chat",     icon:"fa-comments",      tKey:"nav.chatShort"},
  {id:"crops",    icon:"fa-seedling",      tKey:"nav.crops"},
  {id:"plans",    icon:"fa-clipboard-list",tKey:"nav.plans"},
  {id:"disease",  icon:"fa-microscope",    tKey:"nav.diseaseShort"},
  {id:"yield",    icon:"fa-calculator",   tKey:"nav.yieldShort"},
];

export function AppLayout({ children, pageId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mob, setMob] = useState(false);
  const { user: authUser, logout: authLogout } = useAuthStore();
  const user = authUser || (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();
  const activeLoc = useActiveLocation();
  const isLive    = useLocationStore((s) => s.useLive && !!s.livePlace);
  const locDisplay = activeLoc?.display || user?.location || "Set location";
  const active = pageId || [...NAV,...NAV2].find(n=>location.pathname.startsWith(n.path))?.id || "dashboard";
  const goTo = (path) => { setMob(false); navigate(path); };
  const logout = () => { authLogout(); navigate("/login"); };

  return (
    <div className="app-shell">
      <div className={`mob-overlay${mob?" show":""}`} onClick={()=>setMob(false)} />

      <aside className={`sidebar${mob?" mob-open":""}`}>
        <div className="sidebar-inner">
          <div className="sidebar-logo">
            <Link to="/">
              <div className="sidebar-logo-icon"><i className="fa-solid fa-wheat-awn"/></div>
              <span style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:"var(--sidebar-text)"}}>AgriSmart</span>
            </Link>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">{t("nav.mainMenu")}</div>
            {NAV.map(n=>(
              <button key={n.id} className={`nav-item${active===n.id?" active":""}`} onClick={()=>goTo(n.path)}>
                <i className={`fa-solid ${n.icon}`}/> {t(n.tKey)}
              </button>
            ))}
            <div className="nav-section" style={{marginTop:6}}>{t("nav.account")}</div>
            {NAV2.map(n=>(
              <button key={n.id} className={`nav-item${active===n.id?" active":""}`} onClick={()=>goTo(n.path)}>
                <i className={`fa-solid ${n.icon}`}/> {t(n.tKey)}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"/> {t("nav.logout")}
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={()=>setMob(o=>!o)}>
              <span style={{transform:mob?"rotate(45deg) translate(5px,5px)":"none"}}/>
              <span style={{opacity:mob?0:1}}/>
              <span style={{transform:mob?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
            </button>
          </div>
          <div className="topbar-right">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="user-meta" style={{display:"flex",flexDirection:"column"}}>
              <span className="user-name">{user?.name?.split(" ")[0]||"Farmer"}</span>
              <span className="user-loc" title={locDisplay}>
                <i className={`fa-solid ${isLive ? "fa-location-crosshairs" : "fa-location-dot"}`}
                   style={isLive ? {color:"#2ECC71"} : undefined} />
                {locDisplay}
              </span>
            </div>
          </div>
        </header>
        <div className="page-scroll">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
}