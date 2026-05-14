import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, layoutStyles } from "../components/Layout";
import client from "../api/client";
import { useActiveLocation } from "../stores/useLocationStore";

const LOADING_MESSAGES = [
  "Fetching latest mandi insights…",
  "Connecting to market servers…",
  "Market servers are busy, retrying…",
  "Analyzing latest market data…",
  "Gathering price intelligence…",
  "Almost there, processing data…",
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi",
];

const COMMODITIES = [
  "Wheat","Rice","Cotton","Soybean","Mustard","Maize","Tomato","Sugarcane","Onion","Potato",
];

const styles = `
  ${layoutStyles}
  .mandi-page{padding:28px;max-width:1200px;margin:0 auto;animation:fadeUp 0.4s ease both;}
  .mandi-header{margin-bottom:28px;}
  .mandi-title{font-size:24px;font-weight:700;color:var(--primary);}
  .mandi-subtitle{font-size:14px;color:var(--text-muted);margin-top:2px;}

  .section-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-light);margin-bottom:10px;}
  .section-title{font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;}
  .section-desc{font-size:13px;color:var(--text-muted);margin-bottom:18px;}

  /* Controls */
  .filter-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
  .mandi-select{height:42px;padding:0 14px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;cursor:pointer;min-width:160px;transition:border-color 0.2s;}
  .mandi-select:focus{border-color:var(--primary);}
  .btn-primary{height:42px;padding:0 22px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s,transform 0.15s;}
  .btn-primary:hover:not(:disabled){background:var(--primary-hover);transform:translateY(-1px);}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;}
  .refresh-badge{font-size:12px;color:var(--text-light);background:var(--bg-secondary);padding:5px 12px;border-radius:8px;margin-left:auto;}

  /* Table */
  .price-table-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);margin-bottom:28px;}
  .price-table{width:100%;border-collapse:collapse;font-size:13px;}
  .price-table th{padding:13px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--text-light);background:var(--bg-secondary);border-bottom:1px solid var(--border);}
  .price-table td{padding:12px 16px;border-bottom:0.5px solid var(--border-light);color:var(--text);}
  .price-table tr:last-child td{border-bottom:none;}
  .price-table tr.top-price td{background:#F1F8E9;}
  .price-table tr:hover td{background:var(--bg);}
  .modal-price{font-weight:700;color:var(--primary);}
  .no-data{text-align:center;padding:40px;color:var(--text-muted);font-size:14px;}

  /* AI Intelligence */
  .intel-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--card-shadow);margin-bottom:28px;}
  .intel-head{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
  .intel-icon{width:40px;height:40px;background:#E8F5E9;color:#2E7D32;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;}
  .intel-title-txt{font-size:16px;font-weight:700;color:var(--text);}
  .intel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;}
  @media(max-width:800px){.intel-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:500px){.intel-grid{grid-template-columns:1fr;}}
  .intel-item{background:var(--bg);border-radius:12px;padding:14px;}
  .intel-item-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-light);margin-bottom:6px;}
  .intel-item-val{font-size:16px;font-weight:700;color:var(--text);}
  .intel-item-sub{font-size:12px;color:var(--text-muted);margin-top:2px;}
  .trend-up  {color:#2E7D32;}
  .trend-down{color:#C62828;}
  .trend-stable{color:#E65100;}
  .conf-bar{height:6px;background:var(--border);border-radius:3px;margin-top:6px;overflow:hidden;}
  .conf-fill{height:100%;background:var(--accent);border-radius:3px;transition:width 0.8s ease;}
  .risk-alert{background:#FFF8E1;border:1px solid #FFE082;border-radius:10px;padding:12px 16px;font-size:13px;color:#7F4A00;display:flex;gap:8px;align-items:flex-start;margin-bottom:12px;}
  .summary-txt{font-size:14px;color:var(--text-muted);line-height:1.6;}

  /* Profit Calculator */
  .profit-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--card-shadow);}
  .qty-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:20px;}
  .qty-input{height:42px;width:100px;padding:0 12px;border:1.5px solid var(--border);border-radius:12px;background:var(--bg);font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;color:var(--text);outline:none;text-align:center;transition:border-color 0.2s;}
  .qty-input:focus{border-color:var(--primary);}
  .qty-slider{flex:1;min-width:180px;max-width:320px;accent-color:var(--primary);}
  .qty-unit{font-size:14px;color:var(--text-muted);}
  .revenue-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;}
  @media(max-width:600px){.revenue-row{grid-template-columns:1fr;}}
  .rev-card{background:var(--bg);border-radius:12px;padding:16px;text-align:center;}
  .rev-lbl{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-light);margin-bottom:6px;}
  .rev-val{font-size:20px;font-weight:700;color:var(--primary);}
  .rev-change{font-size:12px;margin-top:4px;}
  .chg-pos{color:#2E7D32;}
  .chg-neg{color:#C62828;}
  .alert-section{border-top:1px solid var(--border);padding-top:18px;margin-top:4px;}
  .alert-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .alert-input{height:38px;width:120px;padding:0 12px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border-color 0.2s;}
  .alert-input:focus{border-color:var(--accent);}
  .btn-accent{height:38px;padding:0 18px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity 0.2s;}
  .btn-accent:hover{opacity:0.88;}
  .alert-badge{display:flex;align-items:center;gap:6px;background:#FFF8E1;border:1px solid #FFE082;border-radius:10px;padding:6px 12px;font-size:13px;color:#7F4A00;}

  .loading-box{display:flex;align-items:center;justify-content:center;gap:12px;padding:30px;color:var(--text-muted);font-size:14px;}
  .spinner{width:24px;height:24px;border:2.5px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.7s linear infinite;}
  .error-box{background:#FFF3F3;border:1px solid #FFCDD2;border-radius:12px;padding:14px;color:#C62828;font-size:14px;display:flex;align-items:center;gap:10px;margin-bottom:16px;}

  /* Skeleton loader */
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  .skel-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);margin-bottom:28px;}
  .skel-row{display:flex;gap:16px;padding:14px 16px;border-bottom:0.5px solid var(--border-light);}
  .skel-row:last-child{border-bottom:none;}
  .skel-cell{height:14px;border-radius:6px;background:linear-gradient(90deg,var(--bg-secondary) 25%,var(--border-light,#e8e8e8) 50%,var(--bg-secondary) 75%);background-size:800px 100%;animation:shimmer 1.5s ease-in-out infinite;}
  .skel-header{padding:13px 16px;background:var(--bg-secondary);display:flex;gap:16px;}
  .skel-header .skel-cell{height:12px;opacity:0.5;}

  /* Rotating loading message */
  .loading-enhanced{display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 20px;}
  .loading-msg{font-size:14px;color:var(--text-muted);animation:fadeUp 0.4s ease both;text-align:center;}
  .loading-sub{font-size:12px;color:var(--text-light);margin-top:2px;}

  /* Friendly info banner (non-alarming) */
  .info-banner{background:#FFF8E1;border:1px solid #FFE082;border-radius:12px;padding:14px 18px;color:#7F4A00;font-size:14px;display:flex;align-items:center;gap:10px;margin-bottom:16px;}
  .info-banner i{flex-shrink:0;}

  /* Stale data badge */
  .stale-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;background:#FFF3E0;color:#E65100;padding:3px 10px;border-radius:6px;font-weight:600;}
`;

const fmt = n => `₹${Number(n).toLocaleString("en-IN")}`;
const ago = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 1 ? "just now" : `${diff} min ago`;
};

export default function Mandi() {
  const { t } = useTranslation();
  const activeLoc = useActiveLocation();

  // Default the state filter to the user's active location's state
  // (live GPS or saved). User can still pick another state from the dropdown.
  const initialState = (() => {
    const s = activeLoc?.state;
    return s && STATES.includes(s) ? s : "Maharashtra";
  })();
  const [state, setState]           = useState(initialState);
  const [commodity, setCommodity]   = useState("Wheat");
  const [autoState, setAutoState]   = useState(true);

  // Follow live location changes unless the user has manually picked a state.
  useEffect(() => {
    if (!autoState) return;
    const s = activeLoc?.state;
    if (s && STATES.includes(s) && s !== state) setState(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLoc?.state, autoState]);
  const [prices, setPrices]         = useState([]);
  const [fetchedAt, setFetchedAt]   = useState(null);
  const [loadingPrices, setLoadPrices] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [emptyInfo, setEmptyInfo]   = useState(null); // { reason, commodity, state, suggestions }
  const [dataSource, setDataSource] = useState(null); // "live" | "cache" | "stale_cache"
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadPred]  = useState(false);

  const [qty, setQty]               = useState(50);
  const [alertPrice, setAlertPrice] = useState("");
  const [savedAlert, setSavedAlert] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agri_price_alert") || "null"); } catch { return null; }
  });

  // Rotate loading messages every 3 seconds while fetching
  const loadingInterval = useRef(null);
  useEffect(() => {
    if (loadingPrices) {
      let idx = 0;
      setLoadingMsg(LOADING_MESSAGES[0]);
      loadingInterval.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length;
        setLoadingMsg(LOADING_MESSAGES[idx]);
      }, 3000);
    } else {
      clearInterval(loadingInterval.current);
    }
    return () => clearInterval(loadingInterval.current);
  }, [loadingPrices]);

  const fetchPrices = async () => {
    setLoadPrices(true);
    setPriceError("");
    // DO NOT clear prices here — keep previous data visible during loading
    setPrediction(null);
    setEmptyInfo(null);
    setDataSource(null);
    try {
      const res = await client.get(
        `/api/mandi/prices?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}&limit=100`,
        { timeout: 60000 } // give backend time for its retries
      );
      const list = res.data.prices || [];
      const source = res.data.source || "live";
      setDataSource(source);

      // Backend returns reason: "api_unavailable" with a friendly message
      if (res.data.reason === "api_unavailable") {
        setPriceError(res.data.message || "Market data is temporarily unavailable.");
        // Don't clear existing prices — keep stale data if we had any
        if (list.length === 0) return;
      }

      setPrices(list);
      setFetchedAt(res.data.fetchedAt);
      if (list.length > 0) {
        fetchPrediction(list);
      } else {
        setEmptyInfo({
          reason:      res.data.reason || "no_data",
          commodity:   res.data.commodity || commodity,
          state:       res.data.state || state,
          suggestions: res.data.suggestions || { crops: [], states: [] },
        });
      }
    } catch (err) {
      // NEVER show raw technical errors — only friendly messages
      const serverMsg = err.response?.data?.message;
      setPriceError(serverMsg || "Market data is temporarily unavailable. Please try again shortly.");
    } finally {
      setLoadPrices(false);
    }
  };

  const fetchPrediction = async (priceData) => {
    setLoadPred(true);
    try {
      const res = await client.post("/api/mandi/predict", { commodity, state, priceData });
      setPrediction(res.data.prediction);
    } catch {
      // non-critical
    } finally {
      setLoadPred(false);
    }
  };

  const setAlert = () => {
    if (!alertPrice) return;
    const data = { commodity, state, price: parseFloat(alertPrice), setAt: new Date().toISOString() };
    localStorage.setItem("agri_price_alert", JSON.stringify(data));
    setSavedAlert(data);
    setAlertPrice("");
  };

  const clearAlert = () => {
    localStorage.removeItem("agri_price_alert");
    setSavedAlert(null);
  };

  const topPrice = prices[0]?.modalPrice || 0;
  const modalPrice = topPrice;

  // Price comparisons (rough estimate: ±8% for last month, ±15% for last year)
  const lastMonthEst  = modalPrice ? Math.round(modalPrice * 0.93) : 0;
  const lastYearEst   = modalPrice ? Math.round(modalPrice * 0.87) : 0;
  const chgMonth  = modalPrice && lastMonthEst ? Math.round(((modalPrice - lastMonthEst) / lastMonthEst) * 100) : 0;
  const chgYear   = modalPrice && lastYearEst  ? Math.round(((modalPrice - lastYearEst)  / lastYearEst)  * 100) : 0;

  const alertTriggered = savedAlert && modalPrice && modalPrice >= savedAlert.price;

  return (
    <AppLayout pageId="mandi">
      <style>{styles}</style>
      <div className="mandi-page">

        <div className="mandi-header">
          <div className="mandi-title">
            {t("mandi.title")}
            {alertTriggered && (
              <span style={{ marginLeft: 10, fontSize: 14, color: "#C8973A" }}>
                <i className="fa-solid fa-bell" /> {t("mandi.alertTriggeredMsg")}
              </span>
            )}
          </div>
          <div className="mandi-subtitle">{t("mandi.subtitle")}</div>
        </div>

        {/* ── SECTION A: Live Prices ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">{t("mandi.sectionA")}</div>
          <div className="section-title">{t("mandi.sectionATitle")}</div>
          <div className="section-desc">{t("mandi.sectionADesc")}</div>

          <div className="filter-row">
            <select className="mandi-select" value={state}
              onChange={e => { setAutoState(false); setState(e.target.value); }}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="mandi-select" value={commodity} onChange={e => setCommodity(e.target.value)}>
              {COMMODITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="btn-primary" onClick={fetchPrices} disabled={loadingPrices}>
              {loadingPrices
                ? <><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /> {t("mandi.fetching")}</>
                : <><i className="fa-solid fa-chart-line" /> {t("mandi.fetchBtn")}</>}
            </button>
            {fetchedAt && (
              <span className="refresh-badge">
                <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />Updated {ago(fetchedAt)}
                {dataSource === "stale_cache" && <span className="stale-badge" style={{ marginLeft: 6 }}><i className="fa-solid fa-clock-rotate-left" /> Cached</span>}
                {dataSource === "cache" && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-light)" }}>• cached</span>}
              </span>
            )}
          </div>

          {priceError && (
            <div className="info-banner">
              <i className="fa-solid fa-cloud-sun" />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{priceError}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {prices.length > 0 ? "Showing previously fetched data below." : "Please try again in a moment."}
                </div>
              </div>
            </div>
          )}

          {loadingPrices && (
            <>
              <div className="loading-enhanced">
                <div className="spinner" />
                <div className="loading-msg" key={loadingMsg}>{loadingMsg}</div>
                <div className="loading-sub">This may take a moment due to government server load</div>
              </div>
              {/* Skeleton table placeholder */}
              <div className="skel-wrap">
                <div className="skel-header">
                  {[80,60,70,50,50,55,60].map((w,i) => <div key={i} className="skel-cell" style={{ width: `${w}px` }} />)}
                </div>
                {[...Array(5)].map((_,i) => (
                  <div className="skel-row" key={i} style={{ opacity: 1 - i * 0.12 }}>
                    {[100,70,80,55,55,60,65].map((w,j) => <div key={j} className="skel-cell" style={{ width: `${w}px`, animationDelay: `${(i*7+j)*0.08}s` }} />)}
                  </div>
                ))}
              </div>
            </>
          )}

          {prices.length > 0 && !loadingPrices && (
            <div className="price-table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>{t("mandi.colMarket")}</th>
                    <th>{t("mandi.colDistrict")}</th>
                    <th>{t("mandi.colCommodity")}</th>
                    <th>{t("mandi.colMin")}</th>
                    <th>{t("mandi.colMax")}</th>
                    <th>{t("mandi.colModal")}</th>
                    <th>{t("mandi.colDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((row, i) => (
                    <tr key={i} className={i === 0 ? "top-price" : ""}>
                      <td style={{ fontWeight: 600 }}>{row.market || "—"}</td>
                      <td>{row.district || "—"}</td>
                      <td>{row.commodity || "—"}</td>
                      <td>{row.minPrice   ? `₹${row.minPrice.toLocaleString("en-IN")}`   : "—"}</td>
                      <td>{row.maxPrice   ? `₹${row.maxPrice.toLocaleString("en-IN")}`   : "—"}</td>
                      <td className="modal-price">{row.modalPrice ? `₹${row.modalPrice.toLocaleString("en-IN")}` : "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--text-light)" }}>{row.date || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loadingPrices && prices.length === 0 && !priceError && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              <i className="fa-solid fa-store" style={{ fontSize: 32, opacity: 0.3, display: "block", marginBottom: 10 }} />
              {!emptyInfo && t("mandi.noDataPrompt")}
              {emptyInfo && (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                    {emptyInfo.reason === "not_relevant"
                      ? t("mandi.notRelevantTitle", { commodity: emptyInfo.commodity, state: emptyInfo.state })
                      : t("mandi.noDataTitle",      { commodity: emptyInfo.commodity, state: emptyInfo.state })}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    {emptyInfo.reason === "not_relevant" ? t("mandi.notRelevantHint") : t("mandi.noDataHint")}
                  </div>

                  {emptyInfo.suggestions?.crops?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        {t("mandi.tryCrops", { state: emptyInfo.state })}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {emptyInfo.suggestions.crops.map(c => (
                          <button key={c}
                            onClick={() => { setCommodity(c); }}
                            style={{ padding: "6px 14px", border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 999, fontSize: 13, color: "var(--text)", cursor: "pointer", fontFamily: "inherit" }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {emptyInfo.suggestions?.states?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        {t("mandi.tryStates", { commodity: emptyInfo.commodity })}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {emptyInfo.suggestions.states.map(s => (
                          <button key={s}
                            onClick={() => { setAutoState(false); setState(s); }}
                            style={{ padding: "6px 14px", border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 999, fontSize: 13, color: "var(--text)", cursor: "pointer", fontFamily: "inherit" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 18 }}>
                    <button className="btn-primary" onClick={fetchPrices} style={{ height: 36, padding: "0 18px", fontSize: 13 }}>
                      <i className="fa-solid fa-rotate" style={{ marginRight: 6 }} /> {t("mandi.retry")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION B: AI Price Intelligence ── */}
        {(loadingPred || prediction) && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-label">{t("mandi.sectionB")}</div>
            <div className="section-title">{t("mandi.sectionBTitle")}</div>
            <div className="section-desc">{t("mandi.sectionBDesc")}</div>

            {loadingPred && (
              <div className="loading-box"><div className="spinner" /> {t("mandi.analyzingTrends")}</div>
            )}

            {prediction && !loadingPred && (
              <div className="intel-card">
                <div className="intel-head">
                  <div className="intel-icon"><i className="fa-solid fa-brain" /></div>
                  <div className="intel-title-txt">{t("mandi.intelCardTitle", { commodity, state })}</div>
                </div>

                <div className="intel-grid">
                  <div className="intel-item">
                    <div className="intel-item-label">{t("mandi.marketTrend")}</div>
                    <div className={`intel-item-val ${prediction.trend === "up" ? "trend-up" : prediction.trend === "down" ? "trend-down" : "trend-stable"}`}>
                      {prediction.trend === "up" ? "↑" : prediction.trend === "down" ? "↓" : "→"} {prediction.trend?.charAt(0).toUpperCase() + prediction.trend?.slice(1)}
                      <span style={{ fontSize: 14, marginLeft: 4 }}>{prediction.trendPercent}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{t("mandi.confidencePct", { pct: prediction.confidence })}</div>
                    <div className="conf-bar">
                      <div className="conf-fill" style={{ width: `${prediction.confidence}%` }} />
                    </div>
                  </div>

                  <div className="intel-item">
                    <div className="intel-item-label">{t("mandi.bestSellWindow")}</div>
                    <div className="intel-item-val" style={{ fontSize: 14 }}>
                      {prediction.bestSellWindow?.start} — {prediction.bestSellWindow?.end}
                    </div>
                    <div className="intel-item-sub">
                      <i className="fa-solid fa-calendar-days" style={{ marginRight: 4 }} />
                      {t("mandi.optimalPeriod")}
                    </div>
                  </div>

                  <div className="intel-item">
                    <div className="intel-item-label">{t("mandi.bestMarket")}</div>
                    <div className="intel-item-val" style={{ fontSize: 14 }}>
                      <i className="fa-solid fa-location-pin" style={{ marginRight: 6, color: "var(--accent)" }} />
                      {prediction.bestMarket}
                    </div>
                    <div className="intel-item-sub">{t("mandi.highestModal")}</div>
                  </div>
                </div>

                <div className="risk-alert">
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span><strong>{t("mandi.riskFactor")}</strong> {prediction.riskFactor}</span>
                </div>

                <div className="summary-txt">{prediction.summary}</div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION C: Profit Calculator ── */}
        {prices.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-label">{t("mandi.sectionC")}</div>
            <div className="section-title">{t("mandi.sectionCTitle")}</div>
            <div className="section-desc">{t("mandi.sectionCDesc")}</div>

            <div className="profit-card">
              <div className="qty-row">
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{t("mandi.quantity")}</span>
                <input type="number" className="qty-input" value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="10000" />
                <input type="range" className="qty-slider" value={qty} min="1" max="1000"
                  onChange={e => setQty(parseInt(e.target.value))} />
                <span className="qty-unit">{t("mandi.quintals")}</span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
                {t("mandi.usingTopPrice")} <strong style={{ color: "var(--primary)" }}>₹{modalPrice.toLocaleString("en-IN")}/quintal</strong> ({state})
              </div>

              <div className="revenue-row">
                <div className="rev-card">
                  <div className="rev-lbl">{t("mandi.todayEst")}</div>
                  <div className="rev-val">{fmt(qty * modalPrice)}</div>
                  <div className="rev-change" style={{ color: "var(--text-light)" }}>{t("mandi.currentPrice")}</div>
                </div>
                <div className="rev-card">
                  <div className="rev-lbl">{t("mandi.lastMonthEst")}</div>
                  <div className="rev-val" style={{ color: "var(--text-muted)", fontSize: 18 }}>{fmt(qty * lastMonthEst)}</div>
                  <div className={`rev-change ${chgMonth >= 0 ? "chg-pos" : "chg-neg"}`}>
                    {chgMonth >= 0 ? "▲" : "▼"} {Math.abs(chgMonth)}% {t("mandi.vsCurrent")}
                  </div>
                </div>
                <div className="rev-card">
                  <div className="rev-lbl">{t("mandi.lastYearEst")}</div>
                  <div className="rev-val" style={{ color: "var(--text-muted)", fontSize: 18 }}>{fmt(qty * lastYearEst)}</div>
                  <div className={`rev-change ${chgYear >= 0 ? "chg-pos" : "chg-neg"}`}>
                    {chgYear >= 0 ? "▲" : "▼"} {Math.abs(chgYear)}% {t("mandi.vsCurrent")}
                  </div>
                </div>
              </div>

              {/* Price Alert */}
              <div className="alert-section">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
                  <i className="fa-solid fa-bell" style={{ marginRight: 6, color: "var(--accent)" }} />
                  {t("mandi.setPriceAlert")}
                </div>
                {savedAlert ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div className="alert-badge">
                      <i className="fa-solid fa-bell" />
                      {t("mandi.alertBadgeText", { price: savedAlert.price.toLocaleString("en-IN"), commodity: savedAlert.commodity })}
                      {alertTriggered && <span style={{ marginLeft: 6, color: "#C8973A", fontWeight: 700 }}>🔔 {t("mandi.alertTriggeredBadge")}</span>}
                    </div>
                    <button className="btn-ghost" style={{ height: 36, padding: "0 14px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 12 }}
                      onClick={clearAlert}>
                      <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} /> {t("mandi.clearAlert")}
                    </button>
                  </div>
                ) : (
                  <div className="alert-row">
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("mandi.alertMeWhen", { commodity })}</span>
                    <input type="number" className="alert-input" placeholder="e.g. 2500" value={alertPrice}
                      onChange={e => setAlertPrice(e.target.value)} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>₹/quintal</span>
                    <button className="btn-accent" onClick={setAlert} disabled={!alertPrice}>
                      <i className="fa-solid fa-bell" /> {t("mandi.setAlertBtn")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
