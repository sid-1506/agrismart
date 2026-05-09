import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, layoutStyles } from "../components/Layout";
import client from "../api/client";

/* ── Indian States ── */
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const POPULAR_CROPS = ["Wheat","Rice","Maize","Soybean","Cotton","Sugarcane","Tomato","Potato","Onion","Groundnut","Bajra","Jowar"];

const fmt = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};
const fmtFull = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const styles = `
  ${layoutStyles}

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(28px);}to{opacity:1;transform:translateX(0);} }
  @keyframes pop      { 0%{transform:scale(0.93);opacity:0;}70%{transform:scale(1.02);}100%{transform:scale(1);opacity:1;} }
  @keyframes shimmer  { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
  @keyframes arcDraw  { from{stroke-dashoffset:var(--arc-total);}to{stroke-dashoffset:var(--arc-offset);} }
  @keyframes countUp  { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin     { to{transform:rotate(360deg);} }
  @keyframes pulse    { 0%,100%{opacity:1;}50%{opacity:0.45;} }
  @keyframes floatUp  {
    0%,100%{transform:translateY(0);}
    50%{transform:translateY(-8px);}
  }

  /* ── PAGE ── */
  .pp-wrap { padding: 28px 30px 80px; max-width: 1180px; margin: 0 auto; }

  /* ── HEADER ── */
  .pp-head { margin-bottom: 30px; animation: fadeUp 0.45s ease both; }
  .pp-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(26px, 3vw, 38px);
    color: var(--primary); line-height: 1.15; margin-bottom: 6px;
  }
  .pp-sub { font-size: 14px; font-weight: 300; color: var(--text-muted); }

  /* ── LAYOUT ── */
  .pp-grid {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 22px;
    align-items: start;
  }

  /* ── FORM PANEL ── */
  .form-panel {
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 18px; padding: 26px;
    animation: fadeUp 0.45s 0.06s ease both;
    position: sticky; top: 20px;
  }
  .form-section-title {
    font-family: 'DM Serif Display', serif; font-size: 16px;
    color: var(--primary); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .field-wrap { margin-bottom: 16px; }
  .field-label {
    font-size: 12px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.06em;
    display: block; margin-bottom: 6px;
  }
  .field-input, .field-select {
    width: 100%; font-family: 'Outfit', sans-serif; font-size: 14px;
    color: var(--text); background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 9px; padding: 10px 13px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }
  .field-input:focus, .field-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26,71,49,0.08);
  }
  .field-input::placeholder { color: var(--text-light); }

  /* unit toggle */
  .unit-toggle {
    display: flex; gap: 0; border: 1.5px solid var(--border);
    border-radius: 9px; overflow: hidden;
  }
  .unit-btn {
    flex: 1; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    border: none; padding: 8px 0; cursor: pointer; transition: background 0.18s, color 0.18s;
    background: var(--bg); color: var(--text-muted);
  }
  .unit-btn.active { background: var(--primary); color: var(--sidebar-text); }

  /* crop chips */
  .crop-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .crop-chip {
    font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 500;
    background: var(--bg-secondary); color: var(--text-muted);
    border: 0.5px solid var(--border); border-radius: 20px;
    padding: 4px 11px; cursor: pointer; transition: all 0.15s;
  }
  .crop-chip:hover { background: var(--accent-light); color: var(--primary); border-color: var(--accent); }

  /* currency input */
  .currency-wrap { position: relative; }
  .currency-prefix {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    font-size: 14px; color: var(--text-light); pointer-events: none;
  }
  .currency-input { padding-left: 26px !important; }

  /* calculate button */
  .calc-btn {
    width: 100%; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
    background: var(--primary); color: var(--sidebar-text); border: none;
    padding: 14px; border-radius: 10px; cursor: pointer; margin-top: 6px;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(26,71,49,0.25);
  }
  .calc-btn:hover   { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 22px rgba(26,71,49,0.32); }
  .calc-btn:active  { transform: translateY(0); }
  .calc-btn:disabled { background: var(--border); color: var(--text-light); cursor: not-allowed; box-shadow: none; transform: none; }

  /* ── LOADING STATE ── */
  .loading-panel {
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 18px; padding: 48px 28px;
    display: flex; flex-direction: column; align-items: center; gap: 18px;
    animation: fadeUp 0.4s ease both;
  }
  .loading-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--accent-light); display: flex; align-items: center;
    justify-content: center; font-size: 32px;
    animation: floatUp 2s ease-in-out infinite;
  }
  .loading-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--primary); }
  .loading-sub   { font-size: 13px; color: var(--text-muted); text-align: center; max-width: 280px; line-height: 1.6; }
  .loading-dots  { display: flex; gap: 6px; }
  .loading-dot   {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary); animation: pulse 1.2s ease infinite;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  .loading-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .loading-step  {
    font-size: 12px; color: var(--text-light);
    display: flex; align-items: center; gap: 8px;
    animation: fadeUp 0.5s ease both;
  }
  .loading-step i { color: var(--accent); font-size: 11px; }

  /* ── RESULT PANEL ── */
  .result-panel { animation: slideIn 0.5s ease both; }

  /* Profit header */
  .profit-header {
    background: var(--primary); border-radius: 16px; padding: 24px 26px;
    margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .profit-header::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px; opacity: 0.04;
  }
  .profit-inner { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .profit-label { font-size: 11px; font-weight: 500; color: rgba(247,243,237,0.5); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
  .profit-amount {
    font-family: 'DM Serif Display', serif; font-size: clamp(34px,4vw,50px);
    color: var(--sidebar-text); line-height: 1;
    animation: countUp 0.6s 0.2s ease both;
  }
  .profit-crop { font-size: 13px; color: rgba(247,243,237,0.55); margin-top: 5px; }
  .profit-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px;
    border-radius: 24px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    flex-shrink: 0; margin-top: 4px;
  }

  /* Gauge + metrics row */
  .gauge-metrics-row {
    display: grid; grid-template-columns: auto 1fr; gap: 16px;
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 16px; padding: 20px 22px; margin-bottom: 16px;
    align-items: center;
    animation: pop 0.5s 0.1s ease both;
  }
  .gauge-wrap { display: flex; flex-direction: column; align-items: center; padding-right: 20px; border-right: 0.5px solid var(--border); }
  .gauge-label { font-size: 11px; color: var(--text-light); margin-top: 6px; text-align: center; }

  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-left: 20px; }
  .metric-card  {
    background: var(--bg-secondary); border-radius: 11px; padding: 13px 15px;
    transition: transform 0.2s;
  }
  .metric-card:hover { transform: translateY(-2px); }
  .metric-icon  { font-size: 15px; margin-bottom: 6px; }
  .metric-val   { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--primary); line-height: 1; }
  .metric-lbl   { font-size: 11px; color: var(--text-light); margin-top: 3px; }

  /* Expense breakdown */
  .expense-panel {
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 16px; padding: 20px 22px; margin-bottom: 16px;
    animation: pop 0.5s 0.18s ease both;
  }
  .panel-title { font-family: 'DM Serif Display', serif; font-size: 17px; color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .expense-item { margin-bottom: 12px; }
  .expense-row  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .expense-name { font-size: 13px; font-weight: 500; color: var(--text-muted); }
  .expense-val  { font-size: 13px; font-weight: 600; color: var(--text); }
  .bar-bg       { height: 6px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
  .bar-fill     { height: 100%; border-radius: 4px; transition: width 1s ease; }

  /* Two-column bottom panels */
  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  /* Risk + recommendations */
  .risks-panel, .reco-panel {
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 16px; padding: 18px 20px;
    animation: pop 0.5s 0.25s ease both;
  }
  .risk-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(231,76,60,0.09); color: #C0392B;
    border: 0.5px solid rgba(231,76,60,0.2);
    border-radius: 20px; padding: 5px 12px; font-size: 12px;
    font-weight: 500; margin: 0 4px 8px 0;
  }
  .reco-item {
    display: flex; align-items: flex-start; gap: 9px;
    font-size: 13px; color: var(--text-muted); line-height: 1.55;
    margin-bottom: 9px;
  }
  .reco-icon { color: #27AE60; font-size: 12px; margin-top: 2px; flex-shrink: 0; }

  /* Alternatives */
  .alts-panel {
    background: var(--card); border: 0.5px solid var(--border);
    border-radius: 16px; padding: 18px 20px; margin-bottom: 16px;
    animation: pop 0.5s 0.3s ease both;
  }
  .alt-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 0.5px solid var(--border);
    gap: 12px; flex-wrap: wrap;
  }
  .alt-row:last-child { border-bottom: none; padding-bottom: 0; }
  .alt-crop { font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--primary); }
  .alt-brief { font-size: 12px; color: var(--text-light); margin-top: 2px; }
  .alt-meta  { display: flex; gap: 12px; flex-shrink: 0; }
  .alt-profit { font-size: 14px; font-weight: 700; color: var(--primary); }
  .alt-roi    { font-size: 12px; color: var(--text-light); }

  /* Schemes */
  .schemes-panel {
    background: var(--accent-light); border: 0.5px solid rgba(200,151,58,0.3);
    border-radius: 16px; padding: 18px 20px;
    animation: pop 0.5s 0.35s ease both;
  }
  .scheme-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(200,151,58,0.15); color: var(--primary);
    border: 0.5px solid rgba(200,151,58,0.35);
    border-radius: 20px; padding: 5px 13px;
    font-size: 12px; font-weight: 600; margin: 0 5px 8px 0;
  }

  /* Sell/MSP info */
  .info-row {
    display: flex; gap: 12px; margin-bottom: 16px;
    animation: pop 0.5s 0.22s ease both;
  }
  .info-card {
    flex: 1; background: var(--card); border: 0.5px solid var(--border);
    border-radius: 13px; padding: 14px 16px;
  }
  .info-icon { font-size: 20px; margin-bottom: 6px; }
  .info-val  { font-size: 14px; font-weight: 600; color: var(--primary); }
  .info-lbl  { font-size: 11px; color: var(--text-light); margin-top: 3px; }

  /* recalculate button */
  .recalc-btn {
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    background: none; border: 1.5px solid var(--primary); color: var(--primary);
    border-radius: 9px; padding: 10px 22px; cursor: pointer; margin-top: 4px;
    transition: background 0.18s, color 0.18s;
    display: flex; align-items: center; gap: 7px;
  }
  .recalc-btn:hover { background: var(--primary); color: var(--sidebar-text); }

  /* error banner */
  .err-banner {
    background: rgba(192,57,43,0.09); border: 1px solid rgba(192,57,43,0.22);
    border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #C0392B;
    display: flex; align-items: center; gap: 9px; margin-top: 12px;
    animation: fadeUp 0.3s ease;
  }

  /* empty / intro state */
  .intro-panel {
    background: var(--card); border: 0.5px dashed var(--border);
    border-radius: 18px; padding: 48px 28px;
    display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
    animation: fadeUp 0.45s 0.1s ease both;
  }
  .intro-icon { font-size: 52px; animation: floatUp 3s ease-in-out infinite; }
  .intro-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--primary); }
  .intro-desc  { font-size: 14px; font-weight: 300; color: var(--text-muted); line-height: 1.7; max-width: 340px; }
  .intro-features { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .intro-feat {
    display: flex; align-items: center; gap: 9px;
    font-size: 13px; color: var(--text-muted);
  }
  .intro-feat i { color: var(--accent); font-size: 14px; width: 18px; text-align: center; }

  /* ── RESPONSIVE ── */
  @media(max-width:1000px){
    .pp-grid { grid-template-columns: 1fr !important; }
    .form-panel { position: static; }
    .gauge-metrics-row { grid-template-columns: 1fr !important; }
    .gauge-wrap { border-right: none; border-bottom: 0.5px solid var(--border); padding-right: 0; padding-bottom: 16px; margin-bottom: 4px; }
    .metrics-grid { padding-left: 0; }
  }
  @media(max-width:700px){
    .pp-wrap { padding: 18px 16px 88px; }
    .bottom-grid { grid-template-columns: 1fr !important; }
    .info-row { flex-direction: column; }
  }
`;

/* ── SVG Profit Gauge ── */
function ProfitGauge({ roi, profit, size = 190 }) {
  const r   = size * 0.38;
  const cx  = size / 2;
  const cy  = size * 0.58;
  const pct = Math.min(Math.max(roi, 0), 200) / 200;

  const startX  = cx - r;
  const startY  = cy;
  const endX    = cx + r;
  const endY    = cy;

  const angle  = Math.PI * (1 - pct);
  const valueX = cx + r * Math.cos(angle - Math.PI);
  const valueY = cy - r * Math.sin(angle - Math.PI);

  const largeArc = pct > 0.5 ? 1 : 0;
  const color = profit < 0 ? "#E74C3C" : roi > 80 ? "#2ECC71" : roi > 30 ? "#F39C12" : "#3498DB";

  const circumference = Math.PI * r;
  const dashOffset    = circumference * (1 - pct);

  return (
    <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={profit < 0 ? "#E74C3C" : "#F39C12"} />
          <stop offset="100%" stopColor={profit < 0 ? "#C0392B" : color} />
        </linearGradient>
      </defs>
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
        fill="none" stroke="var(--bg-secondary)" strokeWidth="14" strokeLinecap="round"
      />
      {/* Value arc */}
      {pct > 0.01 && (
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${valueX} ${valueY}`}
          fill="none"
          stroke={profit < 0 ? "#E74C3C" : "url(#gauge-grad)"}
          strokeWidth="14" strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: 0,
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}
      {/* Center number */}
      <text x={cx} y={cy - r * 0.15} textAnchor="middle"
        fontSize={size * 0.145} fontFamily="'DM Serif Display',serif"
        fill={color} fontWeight="bold">
        {roi > 0 ? `+${roi}%` : `${roi}%`}
      </text>
      <text x={cx} y={cy - r * 0.15 + size * 0.095} textAnchor="middle"
        fontSize={size * 0.06} fontFamily="'Outfit',sans-serif" fill="var(--text-light)">
        ROI
      </text>
      {/* Scale labels */}
      <text x={startX - 6} y={startY + 5} textAnchor="end"
        fontSize={size * 0.052} fontFamily="'Outfit',sans-serif" fill="var(--text-light)">0%</text>
      <text x={endX + 6} y={startY + 5} textAnchor="start"
        fontSize={size * 0.052} fontFamily="'Outfit',sans-serif" fill="var(--text-light)">200%</text>
    </svg>
  );
}

/* ── Expense Bar ── */
function ExpenseBar({ name, value, total, color }) {
  const [width, setWidth] = useState(0);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="expense-item">
      <div className="expense-row">
        <span className="expense-name">{name}</span>
        <span className="expense-val">{fmtFull(value)}</span>
      </div>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${width}%`, background: color || "var(--primary)" }} />
      </div>
    </div>
  );
}

const EXPENSE_COLORS = {
  seeds:      "#2ECC71",
  fertilizer: "#3498DB",
  irrigation: "#1ABC9C",
  labor:      "#9B59B6",
  pesticides: "#E74C3C",
  other:      "#95A5A6",
};

// LOADING_STEPS moved inside component to be reactive to language changes

export default function ProfitPlanner() {
  const { t } = useTranslation();

  const LOADING_STEPS = [
    t("yield.loading.step1"),
    t("yield.loading.step2"),
    t("yield.loading.step3"),
    t("yield.loading.step4"),
  ];

  const [step,     setStep]     = useState("form");
  const [loadStep, setLoadStep] = useState(0);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const [cropName,    setCropName]    = useState("");
  const [landArea,    setLandArea]    = useState("");
  const [landUnit,    setLandUnit]    = useState("acres");
  const [state,       setState]       = useState("");
  const [season,      setSeason]      = useState("Kharif");
  const [investment,  setInvestment]  = useState("");

  /* Simulate loading steps */
  useEffect(() => {
    if (step !== "loading") return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setLoadStep(i);
      if (i >= LOADING_STEPS.length) clearInterval(t);
    }, 900);
    return () => clearInterval(t);
  }, [step]);

  const calculate = useCallback(async () => {
    if (!cropName.trim() || !landArea) return;
    setError(null);
    setStep("loading");
    setLoadStep(0);

    try {
      const { data } = await client.post("/api/yield", {
        cropName: cropName.trim(),
        landArea: parseFloat(landArea),
        landUnit,
        state,
        season,
        investment: investment ? parseFloat(investment) : undefined,
      });
      if (data.success) {
        setResult(data.result);
        setStep("result");
      } else {
        setError(data.message || "Estimation failed");
        setStep("form");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setStep("form");
    }
  }, [cropName, landArea, landUnit, state, season, investment]);

  const reset = () => {
    setStep("form");
    setResult(null);
    setError(null);
  };

  const profColor = result
    ? (result.netProfit < 0 ? "#E74C3C" : result.roi > 80 ? "#2ECC71" : "#F39C12")
    : "#2ECC71";

  const profBg = result
    ? (result.netProfit < 0 ? "rgba(231,76,60,0.18)" : result.roi > 80 ? "rgba(46,204,113,0.18)" : "rgba(243,156,18,0.18)")
    : "rgba(46,204,113,0.18)";

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="yield">
        <div className="pp-wrap">

          {/* ── Header ── */}
          <div className="pp-head">
            <h1 className="pp-title">
              <i className="fa-solid fa-calculator" style={{ color: "var(--accent)", marginRight: 10 }}/>
              {t("yield.title")}
            </h1>
            <p className="pp-sub">
              {t("yield.subtitle")}
            </p>
          </div>

          <div className="pp-grid">

            {/* ── LEFT: Form ── */}
            <div className="form-panel">
              <div className="form-section-title">
                <i className="fa-solid fa-seedling" style={{ color: "var(--accent)" }}/>
                {t("yield.farmDetails")}
              </div>

              {/* Crop name */}
              <div className="field-wrap">
                <label className="field-label">{t("yield.cropName")}</label>
                <input
                  className="field-input"
                  placeholder={t("yield.cropNamePlaceholder")}
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                />
                <div className="crop-chips">
                  {POPULAR_CROPS.map(c => (
                    <button key={c} className="crop-chip" onClick={() => setCropName(c)}>{c}</button>
                  ))}
                </div>
              </div>

              {/* Land area */}
              <div className="field-wrap">
                <label className="field-label">{t("yield.landArea")}</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <input
                    className="field-input"
                    type="number"
                    min="0.1"
                    step="0.5"
                    placeholder={t("yield.landAreaPlaceholder")}
                    value={landArea}
                    onChange={e => setLandArea(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div className="unit-toggle">
                  {["acres", "hectares", "bigha"].map(u => (
                    <button
                      key={u}
                      className={`unit-btn${landUnit === u ? " active" : ""}`}
                      onClick={() => setLandUnit(u)}
                    >
                      {t(`yield.units.${u}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* State */}
              <div className="field-wrap">
                <label className="field-label">{t("yield.stateRegion")}</label>
                <select className="field-select" value={state} onChange={e => setState(e.target.value)}>
                  <option value="">{t("yield.selectState")}</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Season */}
              <div className="field-wrap">
                <label className="field-label">{t("yield.season")}</label>
                <select className="field-select" value={season} onChange={e => setSeason(e.target.value)}>
                  <option value="Kharif">{t("yield.seasons.kharif")}</option>
                  <option value="Rabi">{t("yield.seasons.rabi")}</option>
                  <option value="Zaid">{t("yield.seasons.zaid")}</option>
                </select>
              </div>

              {/* Investment */}
              <div className="field-wrap">
                <label className="field-label">{t("yield.investmentBudget")}</label>
                <div className="currency-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    className="field-input currency-input"
                    type="number"
                    placeholder={t("yield.investmentPlaceholder")}
                    value={investment}
                    onChange={e => setInvestment(e.target.value)}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="err-banner">
                  <i className="fa-solid fa-triangle-exclamation"/>
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                className="calc-btn"
                onClick={calculate}
                disabled={!cropName.trim() || !landArea || step === "loading"}
              >
                {step === "loading" ? (
                  <><i className="fa-solid fa-spinner fa-spin"/> {t("yield.analysing")}</>
                ) : (
                  <><i className="fa-solid fa-chart-line"/> {t("yield.calculateProfit")}</>
                )}
              </button>

              {result && (
                <button className="recalc-btn" style={{ width: "100%", marginTop: 10, justifyContent: "center" }} onClick={reset}>
                  <i className="fa-solid fa-rotate-left"/> {t("yield.recalculate")}
                </button>
              )}
            </div>

            {/* ── RIGHT: Results ── */}
            <div>
              {/* Loading */}
              {step === "loading" && (
                <div className="loading-panel">
                  <div className="loading-icon">🌾</div>
                  <div className="loading-title">{t("yield.loading.title")}</div>
                  <div className="loading-sub">
                    {t("yield.loading.sub")}
                  </div>
                  <div className="loading-dots">
                    <div className="loading-dot"/>
                    <div className="loading-dot"/>
                    <div className="loading-dot"/>
                  </div>
                  <div className="loading-steps">
                    {LOADING_STEPS.slice(0, loadStep + 1).map((s, i) => (
                      <div key={i} className="loading-step" style={{ animationDelay: `${i * 0.15}s` }}>
                        <i className="fa-solid fa-check-circle"/>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intro / empty state */}
              {step === "form" && !result && (
                <div className="intro-panel">
                  <div className="intro-icon">💰</div>
                  <div className="intro-title">{t("yield.intro.title")}</div>
                  <div className="intro-desc">
                    {t("yield.intro.desc")}
                  </div>
                  <div className="intro-features">
                    {[
                      ["fa-chart-bar",        t("yield.intro.feat1")],
                      ["fa-indian-rupee-sign", t("yield.intro.feat2")],
                      ["fa-shield-halved",     t("yield.intro.feat3")],
                      ["fa-seedling",          t("yield.intro.feat4")],
                      ["fa-landmark",          t("yield.intro.feat5")],
                    ].map(([icon, text]) => (
                      <div key={text} className="intro-feat">
                        <i className={`fa-solid ${icon}`}/>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {step === "result" && result && (
                <div className="result-panel">

                  {/* Profit header */}
                  <div className="profit-header">
                    <div className="profit-inner">
                      <div>
                        <div className="profit-label">{t("yield.result.estimatedProfit")}</div>
                        <div className="profit-amount">{fmt(result.netProfit)}</div>
                        <div className="profit-crop">
                          {result.landArea} {result.landUnit} of {result.cropName} · {result.season || season}
                        </div>
                      </div>
                      <span className="profit-badge" style={{ background: profBg, color: profColor }}>
                        <i className={`fa-solid ${result.netProfit >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}/>
                        {result.profitability} Profitability
                      </span>
                    </div>
                  </div>

                  {/* Gauge + metrics */}
                  <div className="gauge-metrics-row">
                    <div className="gauge-wrap">
                      <ProfitGauge roi={result.roi} profit={result.netProfit} size={190} />
                      <div className="gauge-label">{t("yield.result.roi")}</div>
                    </div>
                    <div className="metrics-grid">
                      {[
                        { icon: "fa-arrow-up-right-dots", label: t("yield.result.grossRevenue"),   val: fmt(result.grossRevenue),                     color: "#2ECC71" },
                        { icon: "fa-money-bill-wave",     label: t("yield.result.totalExpenses"),  val: fmt(result.estimatedExpenses?.total || 0),     color: "#E74C3C" },
                        { icon: "fa-wheat-awn",           label: t("yield.result.expectedYield"),  val: `${result.totalExpectedYield} Q`,              color: "#3498DB" },
                        { icon: "fa-store",               label: t("yield.result.avgMandiPrice"),  val: `₹${result.avgMarketPrice?.toLocaleString("en-IN")}/Q`, color: "#9B59B6" },
                      ].map(({ icon, label, val, color }) => (
                        <div className="metric-card" key={label}>
                          <div className="metric-icon">
                            <i className={`fa-solid ${icon}`} style={{ color }}/>
                          </div>
                          <div className="metric-val">{val}</div>
                          <div className="metric-lbl">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sell month + MSP */}
                  <div className="info-row">
                    <div className="info-card">
                      <div className="info-icon">📅</div>
                      <div className="info-val">{result.bestSellMonth || "Post-harvest"}</div>
                      <div className="info-lbl">{t("yield.result.bestSell")}</div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">🏛️</div>
                      <div className="info-val" style={{ fontSize: 13, lineHeight: 1.5 }}>{result.mspInfo || "Check local mandi for MSP"}</div>
                      <div className="info-lbl">{t("yield.result.mspInfo")}</div>
                    </div>
                    <div className="info-card">
                      <div className="info-icon">⚠️</div>
                      <div className="info-val" style={{ fontSize: 14 }}>
                        <span style={{
                          color: result.riskLevel === "Low" ? "#2ECC71" : result.riskLevel === "Medium" ? "#F39C12" : "#E74C3C"
                        }}>
                          {result.riskLevel} {t("yield.result.risk")}
                        </span>
                      </div>
                      <div className="info-lbl">{t("yield.result.riskAssessment")}</div>
                    </div>
                  </div>

                  {/* Expense breakdown */}
                  {result.estimatedExpenses && (
                    <div className="expense-panel">
                      <div className="panel-title">
                        <i className="fa-solid fa-chart-pie" style={{ color: "var(--accent)" }}/>
                        {t("yield.result.expenseBreakdown")}
                      </div>
                      {Object.entries(result.estimatedExpenses)
                        .filter(([k]) => k !== "total")
                        .map(([key, val]) => (
                          <ExpenseBar
                            key={key}
                            name={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={val}
                            total={result.estimatedExpenses.total}
                            color={EXPENSE_COLORS[key]}
                          />
                        ))
                      }
                      <div style={{ borderTop: "0.5px solid var(--border)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{t("yield.result.totalExpensesLabel")}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#E74C3C" }}>{fmtFull(result.estimatedExpenses.total)}</span>
                      </div>
                    </div>
                  )}

                  {/* Risks + Recommendations */}
                  <div className="bottom-grid">
                    <div className="risks-panel">
                      <div className="panel-title" style={{ fontSize: 15 }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ color: "#E74C3C" }}/>
                        {t("yield.result.risks")}
                      </div>
                      {(result.risks || []).map((r, i) => (
                        <span key={i} className="risk-tag">
                          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 10 }}/> {r}
                        </span>
                      ))}
                    </div>
                    <div className="reco-panel">
                      <div className="panel-title" style={{ fontSize: 15 }}>
                        <i className="fa-solid fa-lightbulb" style={{ color: "var(--accent)" }}/>
                        {t("yield.result.recommendations")}
                      </div>
                      {(result.recommendations || []).map((r, i) => (
                        <div key={i} className="reco-item">
                          <i className="fa-solid fa-circle-check reco-icon"/>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alternative crops */}
                  {result.alternatives?.length > 0 && (
                    <div className="alts-panel">
                      <div className="panel-title">
                        <i className="fa-solid fa-shuffle" style={{ color: "var(--primary)" }}/>
                        {t("yield.result.compareOtherCrops")}
                      </div>
                      {/* Current crop */}
                      <div className="alt-row" style={{ background: "var(--accent-light)", borderRadius: 10, padding: "12px 14px", marginBottom: 4, borderBottom: "none" }}>
                        <div>
                          <div className="alt-crop" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {result.cropName}
                            <span style={{ fontSize: 10, background: "var(--accent)", color: "var(--sidebar-text)", padding: "2px 8px", borderRadius: 10, fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>{t("yield.result.yourCrop").toUpperCase()}</span>
                          </div>
                          <div className="alt-brief">{result.season || season} {t("yield.result.yourSeason")}</div>
                        </div>
                        <div className="alt-meta">
                          <div>
                            <div className="alt-profit">{fmt(result.netProfit)}</div>
                            <div className="alt-roi">ROI {result.roi}%</div>
                          </div>
                        </div>
                      </div>
                      {result.alternatives.map((alt, i) => (
                        <div key={i} className="alt-row">
                          <div>
                            <div className="alt-crop">{alt.crop}</div>
                            <div className="alt-brief">{alt.brief}</div>
                          </div>
                          <div className="alt-meta">
                            <div>
                              <div className="alt-profit" style={{ color: alt.netProfit > result.netProfit ? "#2ECC71" : "var(--primary)" }}>
                                {fmt(alt.netProfit)}
                              </div>
                              <div className="alt-roi">ROI {alt.roi}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Govt schemes */}
                  {result.govtSchemes?.length > 0 && (
                    <div className="schemes-panel">
                      <div className="panel-title" style={{ fontSize: 15, color: "var(--primary)" }}>
                        <i className="fa-solid fa-landmark" style={{ color: "var(--accent)" }}/>
                        {t("yield.result.govtSchemes")}
                      </div>
                      {result.govtSchemes.map((s, i) => (
                        <span key={i} className="scheme-chip">
                          <i className="fa-solid fa-star" style={{ fontSize: 10 }}/> {s}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
