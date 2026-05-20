import { useState, useEffect, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";
import { useWeather } from "../hooks/useWeather";

const API = import.meta.env.VITE_API_URL ?? "";

const styles = `
  ${layoutStyles}

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes shimmer  {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .d1{animation:fadeUp 0.4s 0.04s ease both;}
  .d2{animation:fadeUp 0.4s 0.10s ease both;}
  .d3{animation:fadeUp 0.4s 0.17s ease both;}
  .d4{animation:fadeUp 0.4s 0.24s ease both;}
  .d5{animation:fadeUp 0.4s 0.31s ease both;}

  /* ── Skeleton ── */
  .skel {
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--surface) 50%, var(--bg-secondary) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 8px;
  }

  /* Welcome Banner */
  .welcome {
    background: var(--primary); border-radius: 16px; padding: 28px 32px;
    position: relative; overflow: hidden; margin-bottom: 22px;
    box-shadow: 0 4px 20px var(--shadow);
  }
  .welcome::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:160px; opacity:0.04;
  }
  .welcome-inner { position:relative; z-index:1; }
  .welcome-body  { display:flex; align-items:center; gap:32px; }
  .welcome-left  { flex:1; min-width:0; }
  .welcome-weather {
    flex-shrink:0; min-width:180px; max-width:220px;
    border-left:1px solid rgba(255,255,255,0.12);
    padding-left:28px;
  }
  .wb-temp   { font-family:'DM Serif Display',serif; font-size:38px; color:var(--sidebar-text); line-height:1; }
  .wb-cond   { font-size:13px; color:rgba(247,243,237,0.65); text-transform:capitalize; margin:4px 0 10px; }
  .wb-city   { font-size:11px; font-weight:500; color:rgba(247,243,237,0.4); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:10px; }
  .wb-stats  { display:flex; flex-direction:column; gap:5px; }
  .wb-stat   { display:flex; align-items:center; gap:7px; font-size:12px; color:rgba(247,243,237,0.7); }
  .wb-stat i { width:12px; text-align:center; color:rgba(247,243,237,0.45); font-size:11px; }
  @media(max-width:760px){
    .welcome-body    { flex-direction:column; align-items:flex-start; gap:18px; }
    .welcome-weather { border-left:none; border-top:1px solid rgba(255,255,255,0.12);
      padding-left:0; padding-top:16px; min-width:0; max-width:100%; width:100%; }
    .wb-stats        { flex-direction:row; gap:14px; flex-wrap:wrap; }
  }

  /* Stats */
  .stats-grid {
    display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px;
  }
  .stat-card {
    background:var(--card); border:0.5px solid var(--border); border-radius:14px; padding:20px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .stat-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px var(--shadow-hover); }
  .stat-icon {
    width:40px; height:40px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:14px; font-size:16px;
  }
  .stat-val   { font-family:'DM Serif Display',serif; font-size:30px; color:var(--primary); line-height:1; }
  .stat-label { font-size:12px; color:var(--text-light); margin-top:4px; }
  .stat-chg   { font-size:11px; margin-top:6px; display:flex; align-items:center; gap:5px; }
  .stat-skel  { height:95px; }

  /* Quick Actions */
  .actions-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .action-card {
    background:var(--card); border:0.5px solid var(--border); border-radius:14px; padding:20px;
    cursor:pointer; text-decoration:none; display:block;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .action-card:hover {
    transform:translateY(-5px);
    box-shadow: 0 14px 36px var(--shadow-hover);
    border-color: var(--primary);
  }
  .action-card:active { transform: translateY(-2px); }
  .action-icon-wrap {
    width:44px; height:44px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:14px; font-size:18px;
  }
  .action-title  { font-family:'DM Serif Display',serif; font-size:16px; color:var(--primary); margin-bottom:4px; }
  .action-desc   { font-size:12px; font-weight:300; color:var(--text-muted); line-height:1.6; }
  .action-cta    { font-size:11px; font-weight:600; color:var(--accent); margin-top:10px; display:flex; align-items:center; gap:5px; }

  /* Bottom grid */
  .bottom-grid { display:grid; grid-template-columns:1fr 320px; gap:18px; }

  /* Section header */
  .sec-head  { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .sec-title { font-family:'DM Serif Display',serif; font-size:20px; color:var(--primary); }
  .see-all   { font-size:13px; font-weight:500; color:var(--accent); text-decoration:none; }
  .see-all:hover { opacity:0.75; }

  /* Plan cards */
  .plan-card {
    background:var(--card); border:0.5px solid var(--border); border-radius:13px;
    padding:17px 20px; margin-bottom:10px; cursor:pointer;
    transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  }
  .plan-card:hover {
    transform:translateY(-3px);
    box-shadow: 0 6px 20px var(--shadow);
    border-color: var(--primary-hover);
  }
  .plan-card:last-child { margin-bottom:0; }
  .prog-bg   { height:5px; background:var(--bg-secondary); border-radius:3px; margin:10px 0 5px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
  .chip {
    display:inline-flex; align-items:center; gap:5px;
    font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px;
  }
  .plan-skel { height:88px; margin-bottom:10px; }

  /* Notifications */
  .notif-card {
    background: var(--card); border: 0.5px solid var(--border); border-radius:13px;
    padding:13px 16px; margin-bottom:8px;
    display:flex; align-items:flex-start; gap:11px;
    transition: box-shadow 0.18s;
  }
  .notif-card:hover { box-shadow: 0 4px 14px var(--shadow); }
  .notif-dot {
    width:8px; height:8px; border-radius:50%; margin-top:4px; flex-shrink:0;
  }
  .notif-text { font-size:13px; color:var(--text-muted); line-height:1.5; }
  .notif-time { font-size:10px; color:var(--text-light); margin-top:3px; }

  /* Right panel */
  .right-panel { display:flex; flex-direction:column; gap:12px; }

  /* Weather */
  .weather-card {
    background: var(--primary); border-radius:14px; padding:18px 20px;
    position:relative; overflow:hidden;
    box-shadow: 0 4px 16px var(--shadow);
  }
  .weather-inner { position:relative; z-index:1; }

  /* Tips */
  .tip-card { background:var(--card); border:0.5px solid var(--border); border-radius:13px; padding:15px 17px; margin-bottom:9px; }
  .tip-tag  { font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--accent); margin-bottom:6px; }
  .tip-body { font-size:13px; font-weight:300; color:var(--text-muted); line-height:1.65; }
  .tip-icon { font-size:17px; margin-bottom:7px; color:var(--primary); }

  /* Empty state */
  .empty { text-align:center; padding:40px 20px; }
  .empty-icon  { font-size:36px; color:var(--accent-light); margin-bottom:12px; }
  .empty-title { font-family:'DM Serif Display',serif; font-size:18px; color:var(--primary); margin-bottom:6px; }
  .empty-desc  { font-size:13px; color:var(--text-light); line-height:1.6; margin-bottom:18px; }
  .empty-btn   {
    display:inline-block; font-weight:600; font-size:14px;
    background:var(--primary); color:var(--sidebar-text); padding:10px 24px;
    border-radius:8px; text-decoration:none; transition:background 0.2s, transform 0.15s;
  }
  .empty-btn:hover { background:var(--primary-hover); transform:translateY(-1px); }

  .wb-btn {
    font-family:'Outfit',sans-serif; font-weight:600; font-size:14px;
    border:none; padding:10px 22px; border-radius:8px; cursor:pointer;
    display:flex; align-items:center; gap:8px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .wb-btn:hover  { transform:translateY(-1px); opacity:0.9; }
  .wb-btn:active { transform:translateY(0); }

  @media(max-width:1200px){
    .actions-grid { grid-template-columns:repeat(2,1fr)!important; }
  }
  @media(max-width:1100px){
    .stats-grid   { grid-template-columns:repeat(2,1fr)!important; }
    .bottom-grid  { grid-template-columns:1fr!important; }
    .right-panel  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  }
  @media(max-width:700px){
    .actions-grid { grid-template-columns:1fr 1fr!important; }
    .right-panel  { grid-template-columns:1fr!important; }
    .page-pad     { padding:18px 16px 88px!important; }
    .welcome      { padding:22px!important; }
  }
`;

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff}d ago`;
};

// ── Skeleton placeholders ──
function SkeletonCard({ height = 95, className = "" }) {
  return <div className={`skel ${className}`} style={{ height }} />;
}

// ── Stat card ──
const StatCard = memo(({ iconClass, iconBg, iconColor, value, label, change, pos }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>
      <i className={`fa-solid ${iconClass}`} style={{ color: iconColor }} />
    </div>
    <div className="stat-val">{value}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-chg" style={{ color: pos ? "#2ECC71" : "var(--text-light)" }}>
      <i className={`fa-solid ${pos ? "fa-arrow-trend-up" : "fa-minus"}`} style={{ fontSize:10 }} />
      {change}
    </div>
  </div>
));
StatCard.displayName = "StatCard";

// ── Plan card ──
const PlanCard = memo(({ plan, onClick, labelActive, labelDone, labelSteps, labelSeason, labelIndia }) => {
  const done  = plan.timeline?.filter(s => s.done).length || 0;
  const total = plan.timeline?.length || 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const isActive = plan.status === "active";
  return (
    <div className="plan-card" onClick={onClick}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:"var(--primary)",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>
            {plan.cropName}
          </div>
          <div style={{ fontSize:12, color:"var(--text-light)" }}>
            {plan.season || labelSeason} · {plan.location || labelIndia} · {timeAgo(plan.createdAt)}
          </div>
        </div>
        <span className="chip" style={{
          background: isActive ? "rgba(26,71,49,0.09)" : "rgba(200,151,58,0.14)",
          color: isActive ? "var(--primary)" : "var(--accent)", flexShrink:0,
        }}>
          <i className={`fa-solid ${isActive ? "fa-circle-dot" : "fa-circle-check"}`}
            style={{ fontSize:8, animation: isActive ? "pulse 2s infinite" : "none" }} />
          {isActive ? labelActive : labelDone}
        </span>
      </div>
      <div className="prog-bg">
        <div className="prog-fill" style={{ width:`${pct}%`,
          background: pct === 100 ? "var(--accent)" : "var(--primary)" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"var(--text-muted)" }}>
          {labelSteps ? labelSteps(done, total) : `${done} of ${total} steps`}
        </span>
        <span style={{ fontSize:12, fontWeight:600,
          color: pct===100 ? "var(--accent)" : "var(--primary)" }}>{pct}%</span>
      </div>
    </div>
  );
});
PlanCard.displayName = "PlanCard";

// ── Smart notifications generator ──
function buildNotifications(weather, plans) {
  const notifs = [];
  const today  = new Date().toLocaleDateString("en-IN",{weekday:"long"});

  if (weather) {
    if (weather.main === "Rain" || weather.main === "Drizzle") {
      notifs.push({ color:"#3498DB", icon:"fa-cloud-rain",
        text:"Rain expected today — skip pesticide spray and irrigation.",
        time:"Weather alert" });
    }
    if (weather.main === "Thunderstorm") {
      notifs.push({ color:"#E74C3C", icon:"fa-bolt",
        text:"Storm warning — avoid field operations and secure equipment.",
        time:"Weather alert" });
    }
    if (weather.humidity > 80) {
      notifs.push({ color:"#F39C12", icon:"fa-droplet",
        text:`High humidity (${weather.humidity}%) — watch for fungal disease outbreaks.`,
        time:"Health alert" });
    }
  }

  const activePlans = plans.filter(p => p.status === "active");
  if (activePlans.length > 0) {
    const nextStep = activePlans[0]?.timeline?.find(s => !s.done);
    if (nextStep) {
      notifs.push({ color:"#27AE60", icon:"fa-clipboard-list",
        text:`Next task for ${activePlans[0].cropName}: "${nextStep.title}" — ${nextStep.description?.slice(0,60)}...`,
        time:"Plan reminder" });
    }
  }

  if (notifs.length === 0) {
    notifs.push({ color:"#27AE60", icon:"fa-check-circle",
      text:`${today}: All clear — good day for regular field inspection.`,
      time:"Daily tip" });
  }

  return notifs;
}

export default function Dashboard() {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const [plans,    setPlans]   = useState([]);
  const [loading,  setLoading] = useState(true);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const { weather, loading: weatherLoading, error: weatherError } = useWeather();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/plans`);
        setPlans(data.plans || []);
      } catch (e) {
        console.error("[Dashboard] plans fetch:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activePlans    = plans.filter(p => p.status === "active").length;
  const completedPlans = plans.filter(p => p.status === "completed").length;
  const totalDone      = plans.reduce((a, p) => a + (p.timeline?.filter(s => s.done).length || 0), 0);
  const uniqueCrops    = [...new Set(plans.map(p => p.cropName))].length;

  const notifications  = buildNotifications(weather, plans);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? t("dashboard.greeting.morning")
         : h < 17 ? t("dashboard.greeting.afternoon")
         : t("dashboard.greeting.evening");
  };

  const ACTIONS = [
    { icon:"fa-comments",        bg:"rgba(26,71,49,0.09)",   ic:"var(--primary)",
      title: t("dashboard.actions.askAI"),       desc: t("dashboard.actions.askAIDesc"),
      cta: t("dashboard.cta.chatNow"), path:"/chat" },
    { icon:"fa-seedling",        bg:"rgba(200,151,58,0.12)", ic:"var(--accent)",
      title: t("dashboard.actions.browseCrops"), desc: t("dashboard.actions.browseCropsDesc"),
      cta: t("dashboard.cta.explore"), path:"/crops" },
    { icon:"fa-file-circle-plus",bg:"rgba(46,204,113,0.1)",  ic:"#27AE60",
      title: t("dashboard.actions.newPlan"),     desc: t("dashboard.actions.newPlanDesc"),
      cta: t("dashboard.cta.createPlan"), path:"/crops" },
    { icon:"fa-microscope",      bg:"rgba(52,152,219,0.1)",  ic:"#3498DB",
      title: t("dashboard.actions.detectDisease"),desc: t("dashboard.actions.detectDiseaseDesc"),
      cta: t("dashboard.cta.detectNow"), path:"/disease" },
  ];

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="dashboard">
        <div style={{ padding:"26px 28px 52px" }}>

          {/* ── Welcome ── */}
          <div className="welcome d1">
            <div className="welcome-inner">
              <div className="welcome-body">

                {/* Left: greeting + CTAs */}
                <div className="welcome-left">
                  <div style={{ fontSize:11, fontWeight:500, color:"rgba(247,243,237,0.5)",
                    letterSpacing:"0.06em", marginBottom:5 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
                  </div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",
                    fontSize:"clamp(20px,3vw,27px)", color:"var(--sidebar-text)", marginBottom:7 }}>
                    {greeting()}, {user?.name?.split(" ")[0] || "Farmer"}
                  </div>
                  <div style={{ fontSize:14, fontWeight:300, color:"rgba(247,243,237,0.62)",
                    maxWidth:480, lineHeight:1.75, marginBottom:18 }}>
                    {activePlans > 0
                      ? t("dashboard.activePlanMsg", { count: activePlans })
                      : t("dashboard.subtitle")}
                  </div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    <button className="wb-btn"
                      style={{ background:"var(--accent)", color:"var(--sidebar-dark)" }}
                      onClick={() => navigate("/chat")}>
                      <i className="fa-solid fa-comments"/> {t("dashboard.actions.askAI")}
                    </button>
                    <button className="wb-btn"
                      style={{ background:"rgba(255,255,255,0.1)", color:"var(--sidebar-text)",
                        border:"1.5px solid rgba(255,255,255,0.22)" }}
                      onClick={() => navigate("/crops")}>
                      <i className="fa-solid fa-seedling"/> {t("dashboard.actions.browseCrops")}
                    </button>
                  </div>
                </div>

                {/* Right: weather inline */}
                <div className="welcome-weather">
                  {weatherLoading ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8,
                      color:"rgba(247,243,237,0.5)", fontSize:12 }}>
                      <div style={{ width:14, height:14, border:"2px solid rgba(247,243,237,0.2)",
                        borderTopColor:"rgba(247,243,237,0.7)", borderRadius:"50%",
                        animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
                      Loading weather...
                    </div>
                  ) : !weatherError && weather ? (
                    <>
                      <div className="wb-city">
                        {weather.city}{weather.country ? `, ${weather.country}` : ""}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                        <div className="wb-temp">{weather.temp}°C</div>
                        {weather.icon && (
                          <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.condition}
                            style={{ width:44, height:44, filter:"brightness(0.88)" }}/>
                        )}
                      </div>
                      <div className="wb-cond">{weather.condition}</div>
                      <div className="wb-stats">
                        <div className="wb-stat">
                          <i className="fa-solid fa-temperature-half"/>
                          {t("weather.feelsLike")} {weather.feelsLike}°C
                        </div>
                        <div className="wb-stat">
                          <i className="fa-solid fa-droplet"/>
                          {weather.humidity}% {t("weather.humidity")}
                        </div>
                        <div className="wb-stat">
                          <i className="fa-solid fa-wind"/>
                          {weather.windSpeed} km/h
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>

              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-grid d2">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonCard key={i} className="stat-skel" />)
            ) : (
              <>
                <StatCard iconClass="fa-clipboard-list" iconBg="rgba(26,71,49,0.1)"   iconColor="var(--primary)"
                  value={activePlans}    label={t("dashboard.stats.activePlans")}
                  change={activePlans > 0 ? t("dashboard.statChange.inProgress") : t("dashboard.statChange.startPlan")} pos={activePlans > 0} />
                <StatCard iconClass="fa-seedling"       iconBg="rgba(200,151,58,0.12)"iconColor="var(--accent)"
                  value={uniqueCrops}    label={t("dashboard.stats.cropsTracked")}
                  change={uniqueCrops > 0 ? t("dashboard.statChange.varieties", { count: uniqueCrops }) : t("dashboard.statChange.addFirstCrop")} pos={uniqueCrops > 0} />
                <StatCard iconClass="fa-check-double"   iconBg="rgba(46,204,113,0.12)"iconColor="#2ECC71"
                  value={totalDone}      label={t("dashboard.stats.tasksCompleted")}
                  change={totalDone > 0 ? t("dashboard.statChange.greatProgress") : t("dashboard.statChange.noStepsYet")} pos={totalDone > 0} />
                <StatCard iconClass="fa-trophy"         iconBg="rgba(200,151,58,0.12)"iconColor="var(--accent)"
                  value={completedPlans} label={t("dashboard.stats.weatherAlerts")}
                  change={completedPlans > 0 ? t("dashboard.statChange.wellDone") : t("dashboard.statChange.noneYet")} pos={completedPlans > 0} />
              </>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="d3" style={{ marginBottom:22 }}>
            <div className="sec-head">
              <h2 className="sec-title">{t("dashboard.quickActions")}</h2>
            </div>
            <div className="actions-grid">
              {ACTIONS.map((a, i) => (
                <Link key={i} to={a.path} className="action-card">
                  <div className="action-icon-wrap" style={{ background: a.bg }}>
                    <i className={`fa-solid ${a.icon}`} style={{ color: a.ic }} />
                  </div>
                  <div className="action-title">{a.title}</div>
                  <div className="action-desc">{a.desc}</div>
                  <div className="action-cta">
                    {a.cta} <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Bottom grid ── */}
          <div className="bottom-grid">

            {/* Plans list */}
            <div className="d4">
              <div className="sec-head">
                <h2 className="sec-title">{t("plans.title")}</h2>
                <Link to="/plans" className="see-all">
                  {t("dashboard.viewAll")} <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }}/>
                </Link>
              </div>
              {loading ? (
                [1,2,3].map(i => <SkeletonCard key={i} className="plan-skel" />)
              ) : plans.length === 0 ? (
                <div style={{ background:"var(--card)", border:"0.5px solid var(--border)", borderRadius:14 }}>
                  <div className="empty">
                    <div className="empty-icon"><i className="fa-solid fa-wheat-awn"/></div>
                    <div className="empty-title">{t("dashboard.noPlans")}</div>
                    <div className="empty-desc">{t("plans.createFirst")}</div>
                    <Link to="/crops" className="empty-btn">{t("dashboard.actions.browseCrops")}</Link>
                  </div>
                </div>
              ) : (
                plans.slice(0, 4).map(p => (
                  <PlanCard
                    key={p._id}
                    plan={p}
                    onClick={() => navigate(`/plans/${p._id}`)}
                    labelActive={t("dashboard.planStatus.active")}
                    labelDone={t("dashboard.planStatus.done")}
                    labelSteps={(d, tot) => t("dashboard.planSteps", { done: d, total: tot })}
                    labelSeason="Season"
                    labelIndia="India"
                  />
                ))
              )}
            </div>

            {/* Right panel */}
            <div className="right-panel d5">

              {/* Smart Notifications */}
              <div>
                <div className="sec-head">
                  <h2 className="sec-title">{t("dashboard.notifications")}</h2>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} className="notif-card">
                    <i className={`fa-solid ${n.icon}`} style={{ color: n.color, fontSize:16, marginTop:2, flexShrink:0 }}/>
                    <div>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div>
                <div className="sec-head">
                  <h2 className="sec-title">{t("dashboard.farmingTip")}</h2>
                </div>
                {[
                  { icon:"fa-earth-asia", tagKey:"dashboard.tips.soilTag",  textKey:"dashboard.tips.soilText" },
                  { icon:"fa-droplet",    tagKey:"dashboard.tips.waterTag", textKey:"dashboard.tips.waterText" },
                  { icon:"fa-brain",      tagKey:"dashboard.tips.aiTag",    textKey:"dashboard.tips.aiText" },
                ].map(({ icon, tagKey, textKey }) => (
                  <div key={tagKey} className="tip-card">
                    <i className={`fa-solid ${icon} tip-icon`}/>
                    <div className="tip-tag">{t(tagKey)}</div>
                    <div className="tip-body">{t(textKey)}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </AppLayout>
    </>
  );
}
