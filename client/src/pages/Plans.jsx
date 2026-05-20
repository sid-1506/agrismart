// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import { AppLayout, layoutStyles } from "../components/Layout";

// const C = {
//   primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
//   accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
//   surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
//   textLight: "#7A9080", white: "#FFFFFF",
// };

// const API = import.meta.env.VITE_API_URL ?? "";

// const styles = `
//   ${layoutStyles}

//   @keyframes fadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
//   @keyframes spin    { to{transform:rotate(360deg);} }
//   @keyframes pulse   { 0%,100%{opacity:1;}50%{opacity:0.4;} }

//   .page-pad { padding: 26px 28px 60px; }

//   /* ── HEADER ── */
//   .page-header {
//     display:flex; align-items:flex-start; justify-content:space-between;
//     flex-wrap:wrap; gap:14px; margin-bottom:24px;
//     animation:fadeUp 0.4s ease both;
//   }
//   .page-title { font-family:'DM Serif Display',serif; font-size:clamp(24px,3vw,32px); color:${C.primary}; }
//   .page-sub   { font-size:14px; font-weight:300; color:${C.textMuted}; margin-top:5px; }
//   .new-plan-btn {
//     display:flex; align-items:center; gap:8px;
//     font-family:'Outfit',sans-serif; font-weight:600; font-size:14px;
//     background:${C.primary}; color:${C.bg}; border:none; padding:11px 20px;
//     border-radius:9px; cursor:pointer; transition:background 0.2s,transform 0.15s;
//     text-decoration:none; flex-shrink:0;
//   }
//   .new-plan-btn:hover { background:${C.secondary}; transform:translateY(-1px); }

//   /* ── STATS ROW ── */
//   .stats-row {
//     display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
//     margin-bottom:22px; animation:fadeUp 0.4s 0.06s ease both;
//   }
//   .mini-stat {
//     background:${C.white}; border:0.5px solid #E0D8CC; border-radius:12px;
//     padding:16px 18px; display:flex; align-items:center; gap:12px;
//   }
//   .mini-stat-icon {
//     width:36px; height:36px; border-radius:9px; flex-shrink:0;
//     display:flex; align-items:center; justify-content:center; font-size:15px;
//   }
//   .mini-stat-val   { font-family:'DM Serif Display',serif; font-size:22px; color:${C.primary}; line-height:1; }
//   .mini-stat-label { font-size:11px; color:${C.textLight}; margin-top:3px; }

//   /* ── FILTER BAR ── */
//   .filter-bar {
//     display:flex; align-items:center; gap:10px; flex-wrap:wrap;
//     margin-bottom:20px; animation:fadeUp 0.4s 0.1s ease both;
//   }
//   .search-wrap {
//     display:flex; align-items:center; gap:8px; flex:1; min-width:180px; max-width:280px;
//     background:${C.white}; border:1.5px solid #D8D0C4; border-radius:9px; padding:9px 13px;
//     transition:border-color 0.2s;
//   }
//   .search-wrap:focus-within { border-color:${C.primary}; }
//   .search-wrap i     { color:${C.textLight}; font-size:13px; }
//   .search-wrap input { background:none; border:none; outline:none; font-family:'Outfit',sans-serif; font-size:14px; color:${C.text}; width:100%; }
//   .search-wrap input::placeholder { color:${C.textLight}; }

//   .filter-chip {
//     font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
//     padding:7px 14px; border-radius:20px; cursor:pointer;
//     border:1.5px solid #D8D0C4; background:${C.white}; color:${C.textMuted};
//     transition:all 0.18s; white-space:nowrap;
//   }
//   .filter-chip:hover  { border-color:${C.primary}; color:${C.primary}; }
//   .filter-chip.active { background:${C.primary}; color:${C.bg}; border-color:${C.primary}; }

//   .sort-select {
//     font-family:'Outfit',sans-serif; font-size:13px; color:${C.textMuted};
//     background:${C.white}; border:1.5px solid #D8D0C4; border-radius:9px;
//     padding:8px 14px; outline:none; cursor:pointer;
//     appearance:none; -webkit-appearance:none;
//     background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237A9080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
//     background-repeat:no-repeat; background-position:right 12px center; padding-right:30px;
//     transition:border-color 0.2s;
//   }
//   .sort-select:focus { border-color:${C.primary}; }

//   /* ── VIEW TOGGLE ── */
//   .view-toggle { display:flex; gap:4px; background:${C.surface}; padding:3px; border-radius:8px; }
//   .view-btn {
//     width:30px; height:30px; border:none; border-radius:6px; cursor:pointer;
//     display:flex; align-items:center; justify-content:center; font-size:13px;
//     background:none; color:${C.textLight}; transition:all 0.18s;
//   }
//   .view-btn.active { background:${C.white}; color:${C.primary}; box-shadow:0 1px 4px rgba(0,0,0,0.08); }

//   /* ── GRID VIEW ── */
//   .plans-grid {
//     display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
//     gap:16px; animation:fadeUp 0.4s 0.14s ease both;
//   }
//   .plan-card-grid {
//     background:${C.white}; border:0.5px solid #E0D8CC; border-radius:16px;
//     overflow:hidden; cursor:pointer;
//     transition:transform 0.22s,box-shadow 0.22s,border-color 0.22s;
//     display:flex; flex-direction:column;
//   }
//   .plan-card-grid:hover { transform:translateY(-5px); box-shadow:0 14px 40px rgba(26,71,49,0.12); border-color:${C.secondary}; }

//   .card-top {
//     height:7px; width:100%;
//     background:linear-gradient(90deg,${C.primary} var(--pct,0%),${C.surface} var(--pct,0%));
//   }
//   .card-body { padding:20px; flex:1; display:flex; flex-direction:column; }
//   .card-name {
//     font-family:'DM Serif Display',serif; font-size:20px; color:${C.primary};
//     margin-bottom:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
//   }
//   .card-meta { font-size:12px; color:${C.textLight}; margin-bottom:14px; }
//   .card-progress-wrap { margin-bottom:12px; }
//   .card-prog-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
//   .card-prog-label { font-size:12px; color:${C.textMuted}; }
//   .card-prog-pct   { font-size:12px; font-weight:600; }
//   .prog-bar-bg   { height:5px; background:${C.surface}; border-radius:3px; overflow:hidden; }
//   .prog-bar-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
//   .card-chips    { display:flex; gap:6px; flex-wrap:wrap; }
//   .card-chip     { font-size:10px; font-weight:600; padding:3px 9px; border-radius:20px; }
//   .card-footer   { display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:14px; border-top:0.5px solid #F0EBE4; }
//   .card-date     { font-size:11px; color:${C.textLight}; display:flex; align-items:center; gap:4px; }
//   .card-action   { font-size:12px; font-weight:600; color:${C.accent}; display:flex; align-items:center; gap:4px; }

//   /* ── LIST VIEW ── */
//   .plans-list { display:flex; flex-direction:column; gap:10px; animation:fadeUp 0.4s 0.14s ease both; }
//   .plan-card-list {
//     background:${C.white}; border:0.5px solid #E0D8CC; border-radius:14px;
//     padding:18px 22px; cursor:pointer; display:flex; align-items:center; gap:18px;
//     transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s;
//   }
//   .plan-card-list:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(26,71,49,0.09); border-color:${C.secondary}; }
//   .list-icon {
//     width:44px; height:44px; border-radius:12px; background:rgba(26,71,49,0.08);
//     display:flex; align-items:center; justify-content:center;
//     color:${C.primary}; font-size:18px; flex-shrink:0;
//   }
//   .list-body   { flex:1; min-width:0; }
//   .list-name   { font-family:'DM Serif Display',serif; font-size:17px; color:${C.primary};
//     overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:3px; }
//   .list-meta   { font-size:12px; color:${C.textLight}; }
//   .list-prog   { width:140px; flex-shrink:0; }
//   .list-chip   { flex-shrink:0; }
//   .list-arrow  { color:${C.textLight}; font-size:14px; flex-shrink:0; transition:color 0.18s; }
//   .plan-card-list:hover .list-arrow { color:${C.primary}; }

//   /* Status chip */
//   .status-chip {
//     display:inline-flex; align-items:center; gap:5px;
//     font-size:11px; font-weight:600; padding:4px 10px;
//     border-radius:20px; white-space:nowrap;
//   }

//   /* ── EMPTY ── */
//   .empty-wrap {
//     background:${C.white}; border:0.5px solid #E0D8CC; border-radius:16px;
//     padding:64px 32px; text-align:center;
//     animation:fadeUp 0.4s 0.14s ease both;
//   }
//   .empty-icon  { font-size:44px; color:${C.accentLight}; margin-bottom:16px; }
//   .empty-title { font-family:'DM Serif Display',serif; font-size:22px; color:${C.primary}; margin-bottom:8px; }
//   .empty-desc  { font-size:14px; font-weight:300; color:${C.textMuted}; line-height:1.75; max-width:400px; margin:0 auto 24px; }

//   /* Delete confirm modal */
//   .del-overlay {
//     position:fixed; inset:0; background:rgba(10,26,18,0.5);
//     z-index:300; display:flex; align-items:center; justify-content:center;
//     padding:20px; backdrop-filter:blur(3px);
//     animation:fadeUp 0.2s ease;
//   }
//   .del-modal {
//     background:${C.white}; border-radius:16px; padding:28px 32px;
//     max-width:400px; width:100%; text-align:center;
//     box-shadow:0 24px 64px rgba(0,0,0,0.18);
//   }
//   .del-icon  { font-size:36px; color:#E57373; margin-bottom:14px; }
//   .del-title { font-family:'DM Serif Display',serif; font-size:20px; color:${C.primary}; margin-bottom:8px; }
//   .del-desc  { font-size:13px; color:${C.textMuted}; line-height:1.65; margin-bottom:22px; }
//   .del-btns  { display:flex; gap:10px; }
//   .del-cancel {
//     flex:1; font-family:'Outfit',sans-serif; font-size:14px; font-weight:500;
//     background:none; color:${C.textMuted}; border:1.5px solid #D8D0C4;
//     border-radius:9px; padding:11px; cursor:pointer; transition:border-color 0.18s;
//   }
//   .del-cancel:hover { border-color:${C.primary}; color:${C.primary}; }
//   .del-confirm {
//     flex:1; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600;
//     background:#C0392B; color:${C.white}; border:none;
//     border-radius:9px; padding:11px; cursor:pointer; transition:background 0.18s;
//   }
//   .del-confirm:hover { background:#A93226; }

//   .spinner { width:26px; height:26px; border:2.5px solid #E0D8CC;
//     border-top-color:${C.primary}; border-radius:50%; animation:spin 0.7s linear infinite; }

//   /* Responsive */
//   @media(max-width:1000px){ .stats-row { grid-template-columns:repeat(2,1fr)!important; } }
//   @media(max-width:700px){
//     .page-pad   { padding:18px 16px 88px!important; }
//     .stats-row  { grid-template-columns:repeat(2,1fr)!important; gap:10px!important; }
//     .plans-grid { grid-template-columns:1fr!important; }
//     .list-prog  { display:none!important; }
//     .filter-bar { gap:8px!important; }
//     .sort-select{ display:none!important; }
//     .page-header{ flex-direction:column!important; }
//     .new-plan-btn{ width:100%!important; justify-content:center!important; }
//   }
// `;

// const timeAgo = (d) => {
//   const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
//   if (diff === 0) return "Today";
//   if (diff === 1) return "Yesterday";
//   if (diff < 7)  return `${diff} days ago`;
//   return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
// };

// const statusStyle = (s) => ({
//   active:    { bg:"rgba(26,71,49,0.1)",    color:C.primary,    icon:"fa-circle-dot",   label:"Active"    },
//   completed: { bg:"rgba(46,204,113,0.1)",  color:"#1A6B3C",    icon:"fa-circle-check", label:"Completed" },
//   abandoned: { bg:"rgba(192,57,43,0.1)",   color:"#922B21",    icon:"fa-circle-xmark", label:"Abandoned" },
// }[s] || { bg:C.surface, color:C.textLight, icon:"fa-circle", label:s });

// /* ── Grid Card ── */
// function PlanCardGrid({ plan, onClick, onDelete }) {
//   const done  = plan.timeline?.filter(s => s.done).length || 0;
//   const total = plan.timeline?.length || 0;
//   const pct   = total ? Math.round((done / total) * 100) : 0;
//   const ss    = statusStyle(plan.status);

//   return (
//     <div className="plan-card-grid" onClick={() => onClick(plan._id)}>
//       <div className="card-top" style={{ "--pct": `${pct}%` }} />
//       <div className="card-body">
//         <div className="card-name">{plan.cropName}</div>
//         <div className="card-meta">
//           {[plan.season, plan.location].filter(Boolean).join(" · ")} · {timeAgo(plan.createdAt)}
//         </div>

//         <div className="card-progress-wrap">
//           <div className="card-prog-row">
//             <span className="card-prog-label">{done} of {total} steps</span>
//             <span className="card-prog-pct" style={{ color: pct===100?C.accent:C.primary }}>{pct}%</span>
//           </div>
//           <div className="prog-bar-bg">
//             <div className="prog-bar-fill"
//               style={{ width:`${pct}%`, background:pct===100?C.accent:C.primary }} />
//           </div>
//         </div>

//         <div className="card-chips" style={{ marginBottom:8 }}>
//           <span className="status-chip" style={{ background:ss.bg, color:ss.color }}>
//             <i className={`fa-solid ${ss.icon}`} style={{ fontSize:8,
//               animation:plan.status==="active"?"pulse 2s infinite":"none" }} />
//             {ss.label}
//           </span>
//         </div>

//         <div className="card-footer">
//           <span className="card-date">
//             <i className="fa-regular fa-calendar" style={{ fontSize:10 }} />
//             Started {timeAgo(plan.createdAt)}
//           </span>
//           <div style={{ display:"flex",alignItems:"center",gap:10 }}>
//             <button onClick={e => { e.stopPropagation(); onDelete(plan); }}
//               style={{ background:"none",border:"none",cursor:"pointer",
//                 color:C.textLight,fontSize:13,padding:"2px",transition:"color 0.18s" }}
//               title="Delete plan">
//               <i className="fa-solid fa-trash" />
//             </button>
//             <span className="card-action">
//               View <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── List Card ── */
// function PlanCardList({ plan, onClick, onDelete }) {
//   const done  = plan.timeline?.filter(s => s.done).length || 0;
//   const total = plan.timeline?.length || 0;
//   const pct   = total ? Math.round((done / total) * 100) : 0;
//   const ss    = statusStyle(plan.status);

//   return (
//     <div className="plan-card-list" onClick={() => onClick(plan._id)}>
//       <div className="list-icon">
//         <i className="fa-solid fa-seedling" />
//       </div>
//       <div className="list-body">
//         <div className="list-name">{plan.cropName}</div>
//         <div className="list-meta">
//           {[plan.season, plan.location].filter(Boolean).join(" · ")} · {timeAgo(plan.createdAt)}
//         </div>
//       </div>
//       <div className="list-prog">
//         <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
//           <span style={{ fontSize:11,color:C.textMuted }}>{done}/{total} steps</span>
//           <span style={{ fontSize:11,fontWeight:600,color:pct===100?C.accent:C.primary }}>{pct}%</span>
//         </div>
//         <div className="prog-bar-bg">
//           <div className="prog-bar-fill"
//             style={{ width:`${pct}%`,background:pct===100?C.accent:C.primary }} />
//         </div>
//       </div>
//       <span className="list-chip status-chip" style={{ background:ss.bg,color:ss.color }}>
//         <i className={`fa-solid ${ss.icon}`} style={{ fontSize:8,
//           animation:plan.status==="active"?"pulse 2s infinite":"none" }} />
//         {ss.label}
//       </span>
//       <button onClick={e=>{ e.stopPropagation(); onDelete(plan); }}
//         style={{ background:"none",border:"none",cursor:"pointer",
//           color:C.textLight,fontSize:13,padding:"4px 6px",transition:"color 0.18s" }}
//         title="Delete plan">
//         <i className="fa-solid fa-trash" />
//       </button>
//       <i className="fa-solid fa-chevron-right list-arrow" />
//     </div>
//   );
// }

// /* ═══════════════════════════════════════
//    MAIN PLANS PAGE
// ═══════════════════════════════════════ */
// export default function Plans() {
//   const navigate = useNavigate();
//   const [plans,    setPlans]    = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [search,   setSearch]   = useState("");
//   const [filter,   setFilter]   = useState("all");   // all | active | completed | abandoned
//   const [sort,     setSort]     = useState("newest");
//   const [view,     setView]     = useState("grid");  // grid | list
//   const [toDelete, setToDelete] = useState(null);    // plan to confirm delete
//   const [deleting, setDeleting] = useState(false);

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get(`${API}/api/plans`,
//         { headers:{ Authorization:`Bearer ${token}` } });
//       setPlans(data.plans || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmDelete = async () => {
//     if (!toDelete) return;
//     setDeleting(true);
//     try {
//       await axios.delete(`${API}/api/plans/${toDelete._id}`,
//         { headers:{ Authorization:`Bearer ${token}` } });
//       setPlans(prev => prev.filter(p => p._id !== toDelete._id));
//       setToDelete(null);
//     } catch {
//       alert("Failed to delete. Please try again.");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Apply search + filter + sort
//   const displayed = plans
//     .filter(p => {
//       const matchSearch = !search || p.cropName.toLowerCase().includes(search.toLowerCase())
//         || (p.location||"").toLowerCase().includes(search.toLowerCase());
//       const matchFilter = filter === "all" || p.status === filter;
//       return matchSearch && matchFilter;
//     })
//     .sort((a, b) => {
//       if (sort === "newest")   return new Date(b.createdAt) - new Date(a.createdAt);
//       if (sort === "oldest")   return new Date(a.createdAt) - new Date(b.createdAt);
//       if (sort === "progress") {
//         const pctA = a.timeline?.length ? Math.round((a.timeline.filter(s=>s.done).length/a.timeline.length)*100) : 0;
//         const pctB = b.timeline?.length ? Math.round((b.timeline.filter(s=>s.done).length/b.timeline.length)*100) : 0;
//         return pctB - pctA;
//       }
//       if (sort === "name") return a.cropName.localeCompare(b.cropName);
//       return 0;
//     });

//   // Stats
//   const total     = plans.length;
//   const active    = plans.filter(p => p.status==="active").length;
//   const completed = plans.filter(p => p.status==="completed").length;
//   const avgPct    = total ? Math.round(
//     plans.reduce((acc,p) => {
//       const done = p.timeline?.filter(s=>s.done).length || 0;
//       const t    = p.timeline?.length || 0;
//       return acc + (t ? done/t : 0);
//     }, 0) / total * 100
//   ) : 0;

//   return (
//     <>
//       <style>{styles}</style>
//       <AppLayout pageId="plans">
//         <div className="page-pad">

//           {/* Header */}
//           <div className="page-header">
//             <div>
//               <h1 className="page-title">
//                 <i className="fa-solid fa-clipboard-list" style={{ marginRight:10,color:C.accent }} />
//                 My Farming Plans
//               </h1>
//               <p className="page-sub">Track and manage all your AI-generated crop plans.</p>
//             </div>
//             <Link to="/crops" className="new-plan-btn">
//               <i className="fa-solid fa-plus" /> New Plan
//             </Link>
//           </div>

//           {/* Stats row */}
//           {!loading && total > 0 && (
//             <div className="stats-row">
//               {[
//                 { icon:"fa-clipboard-list", iconBg:"rgba(26,71,49,0.1)",   iconColor:C.primary,  val:total,     label:"Total Plans"   },
//                 { icon:"fa-circle-dot",     iconBg:"rgba(200,151,58,0.12)",iconColor:C.accent,   val:active,    label:"Active"        },
//                 { icon:"fa-circle-check",   iconBg:"rgba(46,204,113,0.1)", iconColor:"#2ECC71",  val:completed, label:"Completed"     },
//                 { icon:"fa-chart-pie",      iconBg:"rgba(26,71,49,0.08)",  iconColor:C.secondary,val:`${avgPct}%`,label:"Avg Progress" },
//               ].map(({ icon,iconBg,iconColor,val,label }) => (
//                 <div key={label} className="mini-stat">
//                   <div className="mini-stat-icon" style={{ background:iconBg }}>
//                     <i className={`fa-solid ${icon}`} style={{ color:iconColor }} />
//                   </div>
//                   <div>
//                     <div className="mini-stat-val">{val}</div>
//                     <div className="mini-stat-label">{label}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Filter bar */}
//           {!loading && total > 0 && (
//             <div className="filter-bar">
//               <div className="search-wrap">
//                 <i className="fa-solid fa-magnifying-glass" />
//                 <input placeholder="Search plans..."
//                   value={search} onChange={e => setSearch(e.target.value)} />
//                 {search && (
//                   <button onClick={()=>setSearch("")}
//                     style={{ background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:12 }}>
//                     <i className="fa-solid fa-xmark" />
//                   </button>
//                 )}
//               </div>

//               {["all","active","completed","abandoned"].map(f => (
//                 <button key={f} className={`filter-chip${filter===f?" active":""}`}
//                   onClick={() => setFilter(f)}>
//                   {f.charAt(0).toUpperCase()+f.slice(1)}
//                   {f!=="all" && (
//                     <span style={{ marginLeft:5,opacity:0.7 }}>
//                       ({f==="active"?active:f==="completed"?completed:plans.filter(p=>p.status===f).length})
//                     </span>
//                   )}
//                 </button>
//               ))}

//               <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
//                 <option value="newest">Newest first</option>
//                 <option value="oldest">Oldest first</option>
//                 <option value="progress">Most progress</option>
//                 <option value="name">A → Z</option>
//               </select>

//               <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
//                 <span style={{ fontSize:12,color:C.textLight }}>
//                   {displayed.length} plan{displayed.length!==1?"s":""}
//                 </span>
//                 <div className="view-toggle">
//                   <button className={`view-btn${view==="grid"?" active":""}`} onClick={()=>setView("grid")} title="Grid view">
//                     <i className="fa-solid fa-grip" />
//                   </button>
//                   <button className={`view-btn${view==="list"?" active":""}`} onClick={()=>setView("list")} title="List view">
//                     <i className="fa-solid fa-list" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Content */}
//           {loading ? (
//             <div style={{ display:"flex",justifyContent:"center",padding:"80px 0" }}>
//               <div className="spinner" />
//             </div>
//           ) : total === 0 ? (
//             /* Empty — no plans at all */
//             <div className="empty-wrap">
//               <div className="empty-icon"><i className="fa-solid fa-wheat-awn" /></div>
//               <div className="empty-title">No farming plans yet</div>
//               <div className="empty-desc">
//                 Browse our crop library, pick a crop that suits your region and season,
//                 and let AgriSmart AI generate your personalised farming plan in seconds.
//               </div>
//               <Link to="/crops" className="new-plan-btn" style={{ display:"inline-flex" }}>
//                 <i className="fa-solid fa-seedling" /> Browse Crops &amp; Create Plan
//               </Link>
//             </div>
//           ) : displayed.length === 0 ? (
//             /* Empty after filter */
//             <div className="empty-wrap" style={{ padding:"40px 24px" }}>
//               <div className="empty-icon" style={{ fontSize:32 }}><i className="fa-solid fa-filter" /></div>
//               <div className="empty-title" style={{ fontSize:18 }}>No plans match</div>
//               <div className="empty-desc" style={{ fontSize:13 }}>
//                 Try changing your search or filter.
//               </div>
//               <button onClick={() => { setSearch(""); setFilter("all"); }}
//                 style={{ font:"inherit",fontSize:13,fontWeight:600,color:C.accent,
//                   background:"none",border:"none",cursor:"pointer" }}>
//                 Clear filters
//               </button>
//             </div>
//           ) : view === "grid" ? (
//             <div className="plans-grid">
//               {displayed.map(p => (
//                 <PlanCardGrid key={p._id} plan={p}
//                   onClick={id => navigate(`/plans/${id}`)}
//                   onDelete={setToDelete} />
//               ))}
//             </div>
//           ) : (
//             <div className="plans-list">
//               {displayed.map(p => (
//                 <PlanCardList key={p._id} plan={p}
//                   onClick={id => navigate(`/plans/${id}`)}
//                   onDelete={setToDelete} />
//               ))}
//             </div>
//           )}

//         </div>
//       </AppLayout>

//       {/* Delete confirmation modal */}
//       {toDelete && (
//         <div className="del-overlay" onClick={e => { if(e.target===e.currentTarget) setToDelete(null); }}>
//           <div className="del-modal">
//             <div className="del-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
//             <div className="del-title">Delete Plan?</div>
//             <div className="del-desc">
//               This will permanently delete your <strong>{toDelete.cropName}</strong> farming plan
//               and all its timeline progress. This cannot be undone.
//             </div>
//             <div className="del-btns">
//               <button className="del-cancel" onClick={() => setToDelete(null)} disabled={deleting}>
//                 Cancel
//               </button>
//               <button className="del-confirm" onClick={confirmDelete} disabled={deleting}>
//                 {deleting
//                   ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting...</>
//                   : <><i className="fa-solid fa-trash" /> Delete</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";

const C = {
  primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
  accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
  surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
  textLight: "#7A9080", white: "#FFFFFF",
};

const API = import.meta.env.VITE_API_URL ?? "";

const styles = `
  ${layoutStyles}

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin    { to{transform:rotate(360deg);} }
  @keyframes pulse   { 0%,100%{opacity:1;}50%{opacity:0.4;} }

  .page-pad { padding: 26px 28px 60px; }

  /* ── HEADER ── */
  .page-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    flex-wrap:wrap; gap:14px; margin-bottom:24px;
    animation:fadeUp 0.4s ease both;
  }
  .page-title { font-family:'DM Serif Display',serif; font-size:clamp(24px,3vw,32px); color:${C.primary}; }
  .page-sub   { font-size:14px; font-weight:300; color:${C.textMuted}; margin-top:5px; }
  .new-plan-btn {
    display:flex; align-items:center; gap:8px;
    font-family:'Outfit',sans-serif; font-weight:600; font-size:14px;
    background:${C.primary}; color:${C.bg}; border:none; padding:11px 20px;
    border-radius:9px; cursor:pointer; transition:background 0.2s,transform 0.15s;
    text-decoration:none; flex-shrink:0;
  }
  .new-plan-btn:hover { background:${C.secondary}; transform:translateY(-1px); }

  /* ── STATS ROW ── */
  .stats-row {
    display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
    margin-bottom:22px; animation:fadeUp 0.4s 0.06s ease both;
  }
  .mini-stat {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:12px;
    padding:16px 18px; display:flex; align-items:center; gap:12px;
  }
  .mini-stat-icon {
    width:36px; height:36px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:15px;
  }
  .mini-stat-val   { font-family:'DM Serif Display',serif; font-size:22px; color:${C.primary}; line-height:1; }
  .mini-stat-label { font-size:11px; color:${C.textLight}; margin-top:3px; }

  /* ── FILTER BAR ── */
  .filter-bar {
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    margin-bottom:20px; animation:fadeUp 0.4s 0.1s ease both;
  }
  .search-wrap {
    display:flex; align-items:center; gap:8px; flex:1; min-width:180px; max-width:280px;
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:9px; padding:9px 13px;
    transition:border-color 0.2s;
  }
  .search-wrap:focus-within { border-color:${C.primary}; }
  .search-wrap i     { color:${C.textLight}; font-size:13px; }
  .search-wrap input { background:none; border:none; outline:none; font-family:'Outfit',sans-serif; font-size:14px; color:${C.text}; width:100%; }
  .search-wrap input::placeholder { color:${C.textLight}; }

  .filter-chip {
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
    padding:7px 14px; border-radius:20px; cursor:pointer;
    border:1.5px solid #D8D0C4; background:${C.white}; color:${C.textMuted};
    transition:all 0.18s; white-space:nowrap;
  }
  .filter-chip:hover  { border-color:${C.primary}; color:${C.primary}; }
  .filter-chip.active { background:${C.primary}; color:${C.bg}; border-color:${C.primary}; }

  .sort-select {
    font-family:'Outfit',sans-serif; font-size:13px; color:${C.textMuted};
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:9px;
    padding:8px 14px; outline:none; cursor:pointer;
    appearance:none; -webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237A9080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 12px center; padding-right:30px;
    transition:border-color 0.2s;
  }
  .sort-select:focus { border-color:${C.primary}; }

  /* ── VIEW TOGGLE ── */
  .view-toggle { display:flex; gap:4px; background:${C.surface}; padding:3px; border-radius:8px; }
  .view-btn {
    width:30px; height:30px; border:none; border-radius:6px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:13px;
    background:none; color:${C.textLight}; transition:all 0.18s;
  }
  .view-btn.active { background:${C.white}; color:${C.primary}; box-shadow:0 1px 4px rgba(0,0,0,0.08); }

  /* ── GRID VIEW ── */
  .plans-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
    gap:16px; animation:fadeUp 0.4s 0.14s ease both;
  }
  .plan-card-grid {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:16px;
    overflow:hidden; cursor:pointer;
    transition:transform 0.22s,box-shadow 0.22s,border-color 0.22s;
    display:flex; flex-direction:column;
  }
  .plan-card-grid:hover { transform:translateY(-5px); box-shadow:0 14px 40px rgba(26,71,49,0.12); border-color:${C.secondary}; }

  .card-top {
    height:7px; width:100%;
    background:linear-gradient(90deg,${C.primary} var(--pct,0%),${C.surface} var(--pct,0%));
  }
  .card-body { padding:20px; flex:1; display:flex; flex-direction:column; }
  .card-name {
    font-family:'DM Serif Display',serif; font-size:20px; color:${C.primary};
    margin-bottom:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .card-meta { font-size:12px; color:${C.textLight}; margin-bottom:14px; }
  .card-progress-wrap { margin-bottom:12px; }
  .card-prog-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .card-prog-label { font-size:12px; color:${C.textMuted}; }
  .card-prog-pct   { font-size:12px; font-weight:600; }
  .prog-bar-bg   { height:5px; background:${C.surface}; border-radius:3px; overflow:hidden; }
  .prog-bar-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
  .card-chips    { display:flex; gap:6px; flex-wrap:wrap; }
  .card-chip     { font-size:10px; font-weight:600; padding:3px 9px; border-radius:20px; }
  .card-footer   { display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:14px; border-top:0.5px solid #F0EBE4; }
  .card-date     { font-size:11px; color:${C.textLight}; display:flex; align-items:center; gap:4px; }
  .card-action   { font-size:12px; font-weight:600; color:${C.accent}; display:flex; align-items:center; gap:4px; }

  /* ── LIST VIEW ── */
  .plans-list { display:flex; flex-direction:column; gap:10px; animation:fadeUp 0.4s 0.14s ease both; }
  .plan-card-list {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:14px;
    padding:18px 22px; cursor:pointer; display:flex; align-items:center; gap:18px;
    transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s;
  }
  .plan-card-list:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(26,71,49,0.09); border-color:${C.secondary}; }
  .list-icon {
    width:44px; height:44px; border-radius:12px; background:rgba(26,71,49,0.08);
    display:flex; align-items:center; justify-content:center;
    color:${C.primary}; font-size:18px; flex-shrink:0;
  }
  .list-body   { flex:1; min-width:0; }
  .list-name   { font-family:'DM Serif Display',serif; font-size:17px; color:${C.primary};
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:3px; }
  .list-meta   { font-size:12px; color:${C.textLight}; }
  .list-prog   { width:140px; flex-shrink:0; }
  .list-chip   { flex-shrink:0; }
  .list-arrow  { color:${C.textLight}; font-size:14px; flex-shrink:0; transition:color 0.18s; }
  .plan-card-list:hover .list-arrow { color:${C.primary}; }

  /* Status chip */
  .status-chip {
    display:inline-flex; align-items:center; gap:5px;
    font-size:11px; font-weight:600; padding:4px 10px;
    border-radius:20px; white-space:nowrap;
  }

  /* ── EMPTY ── */
  .empty-wrap {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:16px;
    padding:64px 32px; text-align:center;
    animation:fadeUp 0.4s 0.14s ease both;
  }
  .empty-icon  { font-size:44px; color:${C.accentLight}; margin-bottom:16px; }
  .empty-title { font-family:'DM Serif Display',serif; font-size:22px; color:${C.primary}; margin-bottom:8px; }
  .empty-desc  { font-size:14px; font-weight:300; color:${C.textMuted}; line-height:1.75; max-width:400px; margin:0 auto 24px; }

  /* Delete confirm modal */
  .del-overlay {
    position:fixed; inset:0; background:rgba(10,26,18,0.5);
    z-index:300; display:flex; align-items:center; justify-content:center;
    padding:20px; backdrop-filter:blur(3px);
    animation:fadeUp 0.2s ease;
  }
  .del-modal {
    background:${C.white}; border-radius:16px; padding:28px 32px;
    max-width:400px; width:100%; text-align:center;
    box-shadow:0 24px 64px rgba(0,0,0,0.18);
  }
  .del-icon  { font-size:36px; color:#E57373; margin-bottom:14px; }
  .del-title { font-family:'DM Serif Display',serif; font-size:20px; color:${C.primary}; margin-bottom:8px; }
  .del-desc  { font-size:13px; color:${C.textMuted}; line-height:1.65; margin-bottom:22px; }
  .del-btns  { display:flex; gap:10px; }
  .del-cancel {
    flex:1; font-family:'Outfit',sans-serif; font-size:14px; font-weight:500;
    background:none; color:${C.textMuted}; border:1.5px solid #D8D0C4;
    border-radius:9px; padding:11px; cursor:pointer; transition:border-color 0.18s;
  }
  .del-cancel:hover { border-color:${C.primary}; color:${C.primary}; }
  .del-confirm {
    flex:1; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600;
    background:#C0392B; color:${C.white}; border:none;
    border-radius:9px; padding:11px; cursor:pointer; transition:background 0.18s;
  }
  .del-confirm:hover { background:#A93226; }

  .spinner { width:26px; height:26px; border:2.5px solid #E0D8CC;
    border-top-color:${C.primary}; border-radius:50%; animation:spin 0.7s linear infinite; }

  /* Responsive */
  @media(max-width:1000px){ .stats-row { grid-template-columns:repeat(2,1fr)!important; } }
  @media(max-width:700px){
    .page-pad   { padding:18px 16px 88px!important; }
    .stats-row  { grid-template-columns:repeat(2,1fr)!important; gap:10px!important; }
    .plans-grid { grid-template-columns:1fr!important; }
    .list-prog  { display:none!important; }
    .filter-bar { gap:8px!important; }
    .sort-select{ display:none!important; }
    .page-header{ flex-direction:column!important; }
    .new-plan-btn{ width:100%!important; justify-content:center!important; }
  }
`;

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return `${diff} days ago`;
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
};

const statusStyle = (s, t) => ({
  active:    { bg:"rgba(26,71,49,0.1)",    color:C.primary,    icon:"fa-circle-dot",   label: t ? t("plans.status.active")    : "Active"    },
  completed: { bg:"rgba(46,204,113,0.1)",  color:"#1A6B3C",    icon:"fa-circle-check", label: t ? t("plans.status.completed") : "Completed" },
  abandoned: { bg:"rgba(192,57,43,0.1)",   color:"#922B21",    icon:"fa-circle-xmark", label: t ? t("plans.status.abandoned") : "Abandoned" },
}[s] || { bg:C.surface, color:C.textLight, icon:"fa-circle", label:s });

/* ── Grid Card ── */
function PlanCardGrid({ plan, onClick, onDelete }) {
  const { t } = useTranslation();
  const done  = plan.timeline?.filter(s => s.done).length || 0;
  const total = plan.timeline?.length || 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const ss    = statusStyle(plan.status, t);

  return (
    <div className="plan-card-grid" onClick={() => onClick(plan._id)}>
      <div className="card-top" style={{ "--pct": `${pct}%` }} />
      <div className="card-body">
        <div className="card-name">{plan.cropName}</div>
        <div className="card-meta">
          {[plan.season, plan.location].filter(Boolean).join(" · ")} · {timeAgo(plan.createdAt)}
        </div>

        <div className="card-progress-wrap">
          <div className="card-prog-row">
            <span className="card-prog-label">{t("plans.card.steps", { done, total })}</span>
            <span className="card-prog-pct" style={{ color: pct===100?C.accent:C.primary }}>{pct}%</span>
          </div>
          <div className="prog-bar-bg">
            <div className="prog-bar-fill"
              style={{ width:`${pct}%`, background:pct===100?C.accent:C.primary }} />
          </div>
        </div>

        <div className="card-chips" style={{ marginBottom:8 }}>
          <span className="status-chip" style={{ background:ss.bg, color:ss.color }}>
            <i className={`fa-solid ${ss.icon}`} style={{ fontSize:8,
              animation:plan.status==="active"?"pulse 2s infinite":"none" }} />
            {ss.label}
          </span>
        </div>

        <div className="card-footer">
          <span className="card-date">
            <i className="fa-regular fa-calendar" style={{ fontSize:10 }} />
            Started {timeAgo(plan.createdAt, t)}
          </span>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <button onClick={e => { e.stopPropagation(); onDelete(plan); }}
              style={{ background:"none",border:"none",cursor:"pointer",
                color:C.textLight,fontSize:13,padding:"2px",transition:"color 0.18s" }}
              title="Delete plan">
              <i className="fa-solid fa-trash" />
            </button>
            <span className="card-action">
              View <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── List Card ── */
function PlanCardList({ plan, onClick, onDelete }) {
  const { t } = useTranslation();
  const done  = plan.timeline?.filter(s => s.done).length || 0;
  const total = plan.timeline?.length || 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const ss    = statusStyle(plan.status, t);

  return (
    <div className="plan-card-list" onClick={() => onClick(plan._id)}>
      <div className="list-icon">
        <i className="fa-solid fa-seedling" />
      </div>
      <div className="list-body">
        <div className="list-name">{plan.cropName}</div>
        <div className="list-meta">
          {[plan.season, plan.location].filter(Boolean).join(" · ")} · {timeAgo(plan.createdAt)}
        </div>
      </div>
      <div className="list-prog">
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
          <span style={{ fontSize:11,color:C.textMuted }}>{done}/{total} {t("plans.progress")}</span>
          <span style={{ fontSize:11,fontWeight:600,color:pct===100?C.accent:C.primary }}>{pct}%</span>
        </div>
        <div className="prog-bar-bg">
          <div className="prog-bar-fill"
            style={{ width:`${pct}%`,background:pct===100?C.accent:C.primary }} />
        </div>
      </div>
      <span className="list-chip status-chip" style={{ background:ss.bg,color:ss.color }}>
        <i className={`fa-solid ${ss.icon}`} style={{ fontSize:8,
          animation:plan.status==="active"?"pulse 2s infinite":"none" }} />
        {ss.label}
      </span>
      <button onClick={e=>{ e.stopPropagation(); onDelete(plan); }}
        style={{ background:"none",border:"none",cursor:"pointer",
          color:C.textLight,fontSize:13,padding:"4px 6px",transition:"color 0.18s" }}
        title="Delete plan">
        <i className="fa-solid fa-trash" />
      </button>
      <i className="fa-solid fa-chevron-right list-arrow" />
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PLANS PAGE
═══════════════════════════════════════ */
export default function Plans() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");   // all | active | completed | abandoned
  const [sort,     setSort]     = useState("newest");
  const [view,     setView]     = useState("grid");  // grid | list
  const [toDelete, setToDelete] = useState(null);    // plan to confirm delete
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/plans`,
        { headers:{ Authorization:`Bearer ${token}` } });
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/plans/${toDelete._id}`,
        { headers:{ Authorization:`Bearer ${token}` } });
      setPlans(prev => prev.filter(p => p._id !== toDelete._id));
      setToDelete(null);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Apply search + filter + sort
  const displayed = plans
    .filter(p => {
      const matchSearch = !search || p.cropName.toLowerCase().includes(search.toLowerCase())
        || (p.location||"").toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || p.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sort === "newest")   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "progress") {
        const pctA = a.timeline?.length ? Math.round((a.timeline.filter(s=>s.done).length/a.timeline.length)*100) : 0;
        const pctB = b.timeline?.length ? Math.round((b.timeline.filter(s=>s.done).length/b.timeline.length)*100) : 0;
        return pctB - pctA;
      }
      if (sort === "name") return a.cropName.localeCompare(b.cropName);
      return 0;
    });

  // Stats
  const total     = plans.length;
  const active    = plans.filter(p => p.status==="active").length;
  const completed = plans.filter(p => p.status==="completed").length;
  const avgPct    = total ? Math.round(
    plans.reduce((acc,p) => {
      const done = p.timeline?.filter(s=>s.done).length || 0;
      const t    = p.timeline?.length || 0;
      return acc + (t ? done/t : 0);
    }, 0) / total * 100
  ) : 0;

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="plans">
        <div className="page-pad">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <i className="fa-solid fa-clipboard-list" style={{ marginRight:10,color:C.accent }} />
                {t("plans.myFarmingPlans")}
              </h1>
              <p className="page-sub">{t("plans.trackAndManage")}</p>
            </div>
            <Link to="/crops" className="new-plan-btn">
              <i className="fa-solid fa-plus" /> {t("plans.newPlan")}
            </Link>
          </div>

          {/* Stats row */}
          {!loading && total > 0 && (
            <div className="stats-row">
              {[
                { icon:"fa-clipboard-list", iconBg:"rgba(26,71,49,0.1)",   iconColor:C.primary,  val:total,     label:t("plans.stats.totalPlans") },
                { icon:"fa-circle-dot",     iconBg:"rgba(200,151,58,0.12)",iconColor:C.accent,   val:active,    label:t("plans.stats.active")      },
                { icon:"fa-circle-check",   iconBg:"rgba(46,204,113,0.1)", iconColor:"#2ECC71",  val:completed, label:t("plans.stats.completed")   },
                { icon:"fa-chart-pie",      iconBg:"rgba(26,71,49,0.08)",  iconColor:C.secondary,val:`${avgPct}%`,label:t("plans.stats.avgProgress") },
              ].map(({ icon,iconBg,iconColor,val,label }) => (
                <div key={label} className="mini-stat">
                  <div className="mini-stat-icon" style={{ background:iconBg }}>
                    <i className={`fa-solid ${icon}`} style={{ color:iconColor }} />
                  </div>
                  <div>
                    <div className="mini-stat-val">{val}</div>
                    <div className="mini-stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter bar */}
          {!loading && total > 0 && (
            <div className="filter-bar">
              <div className="search-wrap">
                <i className="fa-solid fa-magnifying-glass" />
                <input placeholder={t("plans.filters.searchPlaceholder")}
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && (
                  <button onClick={()=>setSearch("")}
                    style={{ background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:12 }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {["all","active","completed","abandoned"].map(f => (
                <button key={f} className={`filter-chip${filter===f?" active":""}`}
                  onClick={() => setFilter(f)}>
                  {t(`plans.${f === "all" ? "all" : `status.${f}`}`)}
                  {f!=="all" && (
                    <span style={{ marginLeft:5,opacity:0.7 }}>
                      ({f==="active"?active:f==="completed"?completed:plans.filter(p=>p.status===f).length})
                    </span>
                  )}
                </button>
              ))}

              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">{t("plans.filters.newest")}</option>
                <option value="oldest">{t("plans.filters.oldest")}</option>
                <option value="progress">{t("plans.filters.mostProgress")}</option>
                <option value="name">{t("plans.filters.aToZ")}</option>
              </select>

              <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:12,color:C.textLight }}>
                  {displayed.length} {displayed.length!==1 ? t("plans.time.planCountPlural",{count:""}).replace("{{count}}","").trim() : t("plans.time.planCount",{count:""}).replace("{{count}}","").trim()}
                </span>
                <div className="view-toggle">
                  <button className={`view-btn${view==="grid"?" active":""}`} onClick={()=>setView("grid")} title="Grid view">
                    <i className="fa-solid fa-grip" />
                  </button>
                  <button className={`view-btn${view==="list"?" active":""}`} onClick={()=>setView("list")} title="List view">
                    <i className="fa-solid fa-list" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",padding:"80px 0" }}>
              <div className="spinner" />
            </div>
          ) : total === 0 ? (
            /* Empty — no plans at all */
            <div className="empty-wrap">
              <div className="empty-icon"><i className="fa-solid fa-wheat-awn" /></div>
              <div className="empty-title">{t("plans.empty.noPlansTitle")}</div>
              <div className="empty-desc">
                {t("plans.empty.noPlansDesc")}
              </div>
              <Link to="/crops" className="new-plan-btn" style={{ display:"inline-flex" }}>
                <i className="fa-solid fa-seedling" /> {t("plans.empty.browseCrops")}
              </Link>
            </div>
          ) : displayed.length === 0 ? (
            /* Empty after filter */
            <div className="empty-wrap" style={{ padding:"40px 24px" }}>
              <div className="empty-icon" style={{ fontSize:32 }}><i className="fa-solid fa-filter" /></div>
              <div className="empty-title" style={{ fontSize:18 }}>{t("plans.empty.noMatchTitle")}</div>
              <div className="empty-desc" style={{ fontSize:13 }}>
                {t("plans.empty.noMatchDesc")}
              </div>
              <button onClick={() => { setSearch(""); setFilter("all"); }}
                style={{ font:"inherit",fontSize:13,fontWeight:600,color:C.accent,
                  background:"none",border:"none",cursor:"pointer" }}>
                {t("plans.empty.clearFilters")}
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="plans-grid">
              {displayed.map(p => (
                <PlanCardGrid key={p._id} plan={p}
                  onClick={id => navigate(`/plans/${id}`)}
                  onDelete={setToDelete} />
              ))}
            </div>
          ) : (
            <div className="plans-list">
              {displayed.map(p => (
                <PlanCardList key={p._id} plan={p}
                  onClick={id => navigate(`/plans/${id}`)}
                  onDelete={setToDelete} />
              ))}
            </div>
          )}

        </div>
      </AppLayout>

      {/* Delete confirmation modal */}
      {toDelete && (
        <div className="del-overlay" onClick={e => { if(e.target===e.currentTarget) setToDelete(null); }}>
          <div className="del-modal">
            <div className="del-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
            <div className="del-title">{t("plans.delete.title")}</div>
            <div className="del-desc">
              {t("plans.delete.desc", { name: toDelete.cropName })}
            </div>
            <div className="del-btns">
              <button className="del-cancel" onClick={() => setToDelete(null)} disabled={deleting}>
                {t("plans.delete.cancel")}
              </button>
              <button className="del-confirm" onClick={confirmDelete} disabled={deleting}>
                {deleting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> {t("plans.delete.deleting")}</>
                  : <><i className="fa-solid fa-trash" /> {t("plans.delete.confirm")}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}