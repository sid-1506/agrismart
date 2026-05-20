import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  @keyframes checkPop{ 0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);} }
  @keyframes spin    { to{transform:rotate(360deg);} }

  .page-pad { padding:26px 28px 60px; max-width:900px; margin:0 auto; }

  /* Back btn */
  .back-btn {
    display:inline-flex; align-items:center; gap:7px;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    color:${C.textMuted}; background:none; border:none; cursor:pointer;
    padding:0; margin-bottom:22px; transition:color 0.18s;
    animation:fadeUp 0.35s ease both;
  }
  .back-btn:hover { color:${C.primary}; }

  /* Plan header card */
  .plan-header-card {
    background:${C.primary}; border-radius:16px; padding:28px 32px;
    margin-bottom:22px; position:relative; overflow:hidden;
    animation:fadeUp 0.4s 0.05s ease both;
  }
  .plan-header-card::before {
    content:''; position:absolute; inset:0; pointer-events:none; opacity:0.04;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:160px;
  }
  .plan-header-inner { position:relative;z-index:1; }

  /* Progress ring */
  .prog-ring-wrap { position:relative;width:72px;height:72px;flex-shrink:0; }
  .prog-ring-wrap svg { transform:rotate(-90deg); }
  .prog-ring-bg   { fill:none;stroke:rgba(255,255,255,0.15);stroke-width:5; }
  .prog-ring-fill { fill:none;stroke:${C.accent};stroke-width:5;stroke-linecap:round;
    transition:stroke-dashoffset 0.8s ease; }
  .prog-ring-txt  {
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:'DM Serif Display',serif;font-size:16px;color:${C.bg};
  }

  /* Status chips */
  .status-chip {
    display:inline-flex;align-items:center;gap:5px;
    font-size:11px;font-weight:600;padding:4px 11px;border-radius:20px;
    text-transform:uppercase;letter-spacing:0.05em;
  }

  /* Info row */
  .info-row { display:flex;flex-wrap:wrap;gap:16px;margin-top:16px; }
  .info-item { display:flex;align-items:center;gap:7px;font-size:13px;color:rgba(247,243,237,0.65); }
  .info-item i { color:${C.accent};font-size:12px; }

  /* Body grid */
  .body-grid { display:grid;grid-template-columns:1fr 280px;gap:18px;animation:fadeUp 0.4s 0.12s ease both; }

  /* Timeline */
  .timeline-card { background:${C.white};border:0.5px solid #E0D8CC;border-radius:16px;overflow:hidden; }
  .timeline-head { padding:18px 22px;border-bottom:0.5px solid #E0D8CC;
    display:flex;align-items:center;justify-content:space-between; }
  .timeline-title { font-family:'DM Serif Display',serif;font-size:18px;color:${C.primary}; }
  .timeline-subtitle { font-size:12px;color:${C.textLight};margin-top:2px; }

  /* Steps */
  .steps-list { padding:8px 0; }
  .step-row   {
    display:flex;align-items:flex-start;gap:0;padding:0;
    transition:background 0.18s;
    border-bottom:0.5px solid #F0EBE4;
  }
  .step-row:last-child { border-bottom:none; }
  .step-row:hover { background:${C.bg}; }

  .step-connector { display:flex;flex-direction:column;align-items:center;padding:16px 0;width:56px;flex-shrink:0; }
  .step-dot {
    width:28px;height:28px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:600;cursor:pointer;
    transition:all 0.22s;flex-shrink:0;
  }
  .step-dot.done  {
    background:${C.primary};color:${C.bg};border:2px solid ${C.primary};
  }
  .step-dot.done i { animation:checkPop 0.3s ease; }
  .step-dot.pending {
    background:${C.white};color:${C.textLight};
    border:2px solid #D8D0C4;
  }
  .step-dot.pending:hover { border-color:${C.primary};color:${C.primary}; }
  .step-dot.current {
    background:${C.accentLight};color:${C.accent};
    border:2px solid ${C.accent};
  }
  .step-line { width:2px;flex:1;margin-top:4px;border-radius:2px;min-height:16px;transition:background 0.4s; }

  .step-body { flex:1;padding:14px 20px 14px 0; }
  .step-title { font-size:14px;font-weight:500;margin-bottom:3px;transition:color 0.18s; }
  .step-title.done { color:${C.primary}; }
  .step-title.pending { color:${C.textMuted}; }
  .step-desc  { font-size:12px;font-weight:300;color:${C.textLight};line-height:1.65;margin-bottom:5px; }
  .step-meta  { display:flex;align-items:center;gap:10px; }
  .step-date  { font-size:11px;color:${C.textLight};display:flex;align-items:center;gap:4px; }
  .step-badge-done { font-size:10px;font-weight:600;color:#2ECC71;
    background:rgba(46,204,113,0.1);padding:2px 8px;border-radius:10px; }

  /* Toggle all btn */
  .toggle-all {
    font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;
    color:${C.textLight};background:none;border:none;cursor:pointer;
    display:flex;align-items:center;gap:5px;transition:color 0.18s;
  }
  .toggle-all:hover { color:${C.primary}; }

  /* Right panel */
  .right-col { display:flex;flex-direction:column;gap:14px; }

  /* Summary card */
  .summary-card { background:${C.white};border:0.5px solid #E0D8CC;border-radius:14px;padding:20px; }
  .summary-title{ font-family:'DM Serif Display',serif;font-size:17px;color:${C.primary};margin-bottom:14px; }
  .summary-stat { display:flex;justify-content:space-between;align-items:center;
    padding:9px 0;border-bottom:0.5px solid #F0EBE4; }
  .summary-stat:last-child { border-bottom:none; }
  .summary-label{ font-size:13px;color:${C.textMuted};display:flex;align-items:center;gap:7px; }
  .summary-label i { color:${C.accent};font-size:12px; }
  .summary-val  { font-size:13px;font-weight:600;color:${C.primary}; }

  /* AI Plan section */
  .ai-plan-card { background:${C.white};border:0.5px solid #E0D8CC;border-radius:14px;overflow:hidden; }
  .ai-plan-head { background:${C.primary};padding:14px 18px;display:flex;align-items:center;gap:8px; }
  .ai-plan-body { padding:16px 18px;font-size:13px;font-weight:300;color:${C.textMuted};line-height:1.75; }

  /* Actions */
  .action-btn {
    width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
    font-family:'Outfit',sans-serif;font-weight:600;font-size:14px;
    padding:12px;border-radius:10px;cursor:pointer;border:none;
    transition:background 0.2s,transform 0.15s;
  }
  .action-btn:hover { transform:translateY(-1px); }
  .action-btn.primary { background:${C.primary};color:${C.bg}; }
  .action-btn.primary:hover { background:${C.secondary}; }
  .action-btn.danger  { background:rgba(192,57,43,0.1);color:#C0392B;border:1px solid rgba(192,57,43,0.2); }
  .action-btn.danger:hover { background:rgba(192,57,43,0.15); }

  /* Locked step */
  .step-dot.locked {
    background:${C.surface};color:#C0B8AD;
    border:2px solid #D8D0C4;cursor:not-allowed!important;opacity:0.5;
  }

  /* Warning toast */
  .warn-toast {
    position:fixed;bottom:84px;left:50%;transform:translateX(-50%);
    background:#FFF3CD;color:#856404;border:1px solid #FFE083;
    padding:11px 20px;border-radius:10px;font-size:13px;font-weight:500;
    z-index:9999;animation:fadeUp 0.28s ease;
    display:flex;align-items:center;gap:8px;
    box-shadow:0 4px 16px rgba(0,0,0,0.13);
    max-width:90vw;white-space:nowrap;
  }

  /* Loading / error */
  .center-state { display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 20px;text-align:center; }
  .spinner { width:28px;height:28px;border:2.5px solid #E0D8CC;
    border-top-color:${C.primary};border-radius:50%;animation:spin 0.7s linear infinite; }

  /* Responsive */
  @media(max-width:860px){ .body-grid { grid-template-columns:1fr!important; } }
  @media(max-width:600px){
    .page-pad        { padding:16px 14px 88px!important; }
    .plan-header-card{ padding:22px!important; }
    .step-body       { padding-right:14px!important; }
  }
`;

/* ── Circular progress ring ── */
function ProgressRing({ pct }) {
  const r = 30, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="prog-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle className="prog-ring-bg"  cx="36" cy="36" r={r} />
        <circle className="prog-ring-fill" cx="36" cy="36" r={r}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="prog-ring-txt">{pct}%</div>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling,setToggling]= useState({});
  const [error,   setError]   = useState("");
  const [warning, setWarning] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/plans/${id}`,
        { headers:{ Authorization:`Bearer ${token}` } });
      setPlan(data.plan);
    } catch {
      setError(t("planDetail.couldNotLoad"));
    } finally {
      setLoading(false);
    }
  };

  const showWarning = (msg) => {
    setWarning(msg);
    setTimeout(() => setWarning(""), 4000);
  };

  const toggleStep = async (stepId, currentDone) => {
    if (!stepId || toggling[stepId]) return;

    const steps = plan.timeline;
    const clickedIndex = steps.findIndex(s => String(s._id) === String(stepId));
    const completedCount = steps.filter(s => s.done).length;

    if (!currentDone) {
      // Marking done: must be the very next undone step
      if (clickedIndex !== completedCount) {
        showWarning(t("planDetail.warnings.completeFirst", { title: steps[completedCount].title }));
        return;
      }
    } else {
      // Marking undone: only allow the last completed step
      if (clickedIndex !== completedCount - 1) {
        showWarning(t("planDetail.warnings.undoOnly"));
        return;
      }
    }

    setToggling(prev => ({ ...prev, [stepId]:true }));

    // Optimistic update
    setPlan(prev => ({
      ...prev,
      timeline: prev.timeline.map(s =>
        String(s._id) === String(stepId) ? { ...s, done: !currentDone } : s
      ),
    }));

    try {
      const { data } = await axios.patch(
        `${API}/api/plans/${id}/step/${stepId}`,
        { done:!currentDone },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      if (data.success && data.plan) setPlan(data.plan);
    } catch (err) {
      console.error("Toggle step error:", err);
      if (err.response?.status === 400) {
        showWarning(err.response.data?.message || t("planDetail.warnings.outOfOrder"));
      }
      // Revert optimistic update
      setPlan(prev => ({
        ...prev,
        timeline: prev.timeline.map(s =>
          String(s._id) === String(stepId) ? { ...s, done: currentDone } : s
        ),
      }));
    } finally {
      setToggling(prev => ({ ...prev, [stepId]:false }));
    }
  };

  const deletePlan = async () => {
    if (!confirm(t("planDetail.deleteConfirm"))) return;
    try {
      await axios.delete(`${API}/api/plans/${id}`,
        { headers:{ Authorization:`Bearer ${token}` } });
      navigate("/dashboard");
    } catch {
      alert(t("planDetail.deleteFailed"));
    }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <AppLayout>
        <div className="center-state"><div className="spinner" /></div>
      </AppLayout>
    </>
  );

  if (error || !plan) return (
    <>
      <style>{styles}</style>
      <AppLayout>
        <div className="center-state">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize:36,color:C.accentLight,marginBottom:14 }} />
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:C.primary,marginBottom:6 }}>
            {t("planDetail.planNotFound")}
          </div>
          <div style={{ fontSize:13,color:C.textLight,marginBottom:20 }}>{error}</div>
          <button className="action-btn primary" style={{ width:"auto",padding:"10px 24px" }}
            onClick={() => navigate("/dashboard")}>
            {t("planDetail.backToDashboard")}
          </button>
        </div>
      </AppLayout>
    </>
  );

  const done    = plan.timeline.filter(s => s.done).length;
  const total   = plan.timeline.length;
  const pct     = total ? Math.round((done / total) * 100) : 0;
  const isActive = plan.status === "active";
  const nextStep = plan.timeline.find(s => !s.done);

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="plans">
        <div className="page-pad">

          {/* Back */}
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <i className="fa-solid fa-arrow-left" /> {t("planDetail.backToDashboard")}
          </button>

          {/* Plan header */}
          <div className="plan-header-card">
            <div className="plan-header-inner">
              <div style={{ display:"flex",alignItems:"flex-start",
                justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                    <span className="status-chip" style={{
                      background: isActive?"rgba(200,151,58,0.2)":"rgba(46,204,113,0.2)",
                      color: isActive?C.accent:"#2ECC71",
                    }}>
                      <i className={`fa-solid ${isActive?"fa-circle-dot":"fa-circle-check"}`}
                        style={{ fontSize:8, animation:isActive?"pulse 2s infinite":"none" }} />
                      {isActive ? t("planDetail.status.active") : t("planDetail.status.completed")}
                    </span>
                  </div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",
                    fontSize:"clamp(22px,3vw,30px)",color:C.bg,lineHeight:1.15,marginBottom:6 }}>
                    {plan.cropName}
                  </div>
                  {nextStep && (
                    <div style={{ fontSize:13,color:"rgba(247,243,237,0.6)",
                      display:"flex",alignItems:"center",gap:6 }}>
                      <i className="fa-solid fa-circle-arrow-right" style={{ color:C.accent }} />
                      {t("planDetail.next")}: <strong style={{ color:"rgba(247,243,237,0.85)" }}>{nextStep.title}</strong>
                    </div>
                  )}
                  <div className="info-row">
                    {plan.season && (
                      <span className="info-item">
                        <i className="fa-solid fa-calendar" /> {plan.season}
                      </span>
                    )}
                    {plan.location && (
                      <span className="info-item">
                        <i className="fa-solid fa-location-dot" /> {plan.location}
                      </span>
                    )}
                    <span className="info-item">
                      <i className="fa-solid fa-layer-group" /> {t("planDetail.steps", { done, total })}
                    </span>
                    <span className="info-item">
                      <i className="fa-regular fa-calendar" />
                      {new Date(plan.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    </span>
                  </div>
                </div>
                <ProgressRing pct={pct} />
              </div>

              {/* Progress bar */}
              <div style={{ marginTop:18,background:"rgba(255,255,255,0.1)",
                borderRadius:4,height:6,overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:4,
                  background: pct===100?C.accent:C.bg,
                  width:`${pct}%`,transition:"width 0.8s ease" }} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="body-grid">

            {/* Timeline */}
            <div className="timeline-card">
              <div className="timeline-head">
                <div>
                  <div className="timeline-title">{t("planDetail.farmingTimeline")}</div>
                  <div className="timeline-subtitle">{t("planDetail.activitiesCompleted", { done, total })}</div>
                </div>
              </div>

              <div className="steps-list">
                {plan.timeline.map((step, i) => {
                  const isLast    = i === plan.timeline.length - 1;
                  const isCurrent = !step.done && i === plan.timeline.findIndex(s => !s.done);
                  const isLocked  = !step.done && !isCurrent;
                  const stepKey   = step._id || `step-${i}`;

                  const handleStepClick = () => {
                    if (isLocked) {
                      const completedCount = plan.timeline.filter(s => s.done).length;
                      showWarning(t("planDetail.warnings.completeFirst", { title: plan.timeline[completedCount].title }));
                      return;
                    }
                    toggleStep(stepKey, step.done);
                  };

                  return (
                    <div key={stepKey} className="step-row">
                      <div className="step-connector">
                        <div
                          className={`step-dot${step.done?" done":isCurrent?" current":isLocked?" locked":" pending"}`}
                          onClick={handleStepClick}
                          style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                          title={isLocked ? t("planDetail.warnings.completeFirst", { title: "" }).replace('""', "").trim() : step.done ? t("planDetail.stepDone") : t("planDetail.stepUpNext")}>
                          {toggling[stepKey]
                            ? <div style={{ width:12,height:12,border:"2px solid currentColor",
                                borderTopColor:"transparent",borderRadius:"50%",
                                animation:"spin 0.6s linear infinite" }} />
                            : step.done
                              ? <i className="fa-solid fa-check" style={{ fontSize:11 }} />
                              : isCurrent
                                ? <i className="fa-solid fa-circle-dot" style={{ fontSize:10 }} />
                                : <span style={{ fontSize:11,fontWeight:600 }}>{i+1}</span>
                          }
                        </div>
                        {!isLast && (
                          <div className="step-line"
                            style={{ background:step.done?C.primary:"#E0D8CC" }} />
                        )}
                      </div>

                      <div className="step-body">
                        <div className={`step-title${step.done?" done":" pending"}`}>
                          {step.title}
                        </div>
                        {step.description && (
                          <div className="step-desc">{step.description}</div>
                        )}
                        <div className="step-meta">
                          {step.date && (
                            <span className="step-date">
                              <i className="fa-regular fa-calendar" style={{ fontSize:9 }} />
                              {step.date}
                            </span>
                          )}
                          {step.done && (
                            <span className="step-badge-done">
                              <i className="fa-solid fa-check" style={{ fontSize:9,marginRight:3 }} />
                              {t("planDetail.stepDone")}
                            </span>
                          )}
                          {isCurrent && (
                            <span style={{ fontSize:10,fontWeight:600,color:C.accent,
                              background:"rgba(200,151,58,0.12)",padding:"2px 8px",borderRadius:10 }}>
                              {t("planDetail.stepUpNext")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div className="right-col">

              {/* Summary */}
              <div className="summary-card">
                <div className="summary-title">{t("planDetail.planSummary")}</div>
                {[
                  { icon:"fa-seedling",        label:t("planDetail.summary.crop"),      val:plan.cropName },
                  { icon:"fa-calendar",        label:t("planDetail.summary.season"),    val:plan.season || "—" },
                  { icon:"fa-location-dot",    label:t("planDetail.summary.location"),  val:plan.location || "India" },
                  { icon:"fa-check-double",    label:t("planDetail.summary.completed"), val:t("planDetail.summary.steps", { count: done }) },
                  { icon:"fa-hourglass-half",  label:t("planDetail.summary.remaining"), val:t("planDetail.summary.steps", { count: total - done }) },
                  { icon:"fa-chart-pie",       label:t("planDetail.summary.progress"),  val:`${pct}%` },
                ].map(({ icon,label,val }) => (
                  <div key={label} className="summary-stat">
                    <span className="summary-label">
                      <i className={`fa-solid ${icon}`} /> {label}
                    </span>
                    <span className="summary-val">{val}</span>
                  </div>
                ))}
              </div>

              {/* AI Plan summary */}
              {plan.aiPlan && (
                <div className="ai-plan-card">
                  <div className="ai-plan-head">
                    <i className="fa-solid fa-brain" style={{ color:C.accent,fontSize:14 }} />
                    <span style={{ fontFamily:"'Outfit',sans-serif",fontSize:13,
                      fontWeight:600,color:C.bg }}>{t("planDetail.aiPlanOverview")}</span>
                  </div>
                  <div className="ai-plan-body">{plan.aiPlan}</div>
                </div>
              )}

              {/* Actions */}
              <button className="action-btn primary"
                onClick={() => navigate("/chat")}>
                <i className="fa-solid fa-comments" /> {t("planDetail.actions.askAI")}
              </button>
              <button className="action-btn primary"
                style={{ background:"transparent",color:C.primary,
                  border:`1.5px solid ${C.accentLight}` }}
                onClick={() => navigate("/crops")}>
                <i className="fa-solid fa-seedling" /> {t("planDetail.actions.browseCrops")}
              </button>
              <button className="action-btn danger" onClick={deletePlan}>
                <i className="fa-solid fa-trash" /> {t("planDetail.actions.deletePlan")}
              </button>
            </div>

          </div>
        </div>
      </AppLayout>

      {warning && (
        <div className="warn-toast">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize:14 }} />
          {warning}
        </div>
      )}
    </>
  );
}
