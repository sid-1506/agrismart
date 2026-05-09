import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, layoutStyles } from "../components/Layout";
import client from "../api/client";
import useLocationStore, { useActiveLocation, useLocationCoords } from "../stores/useLocationStore";

const CROPS = ["Wheat","Rice","Cotton","Soybean","Mustard","Maize","Tomato","Sugarcane"];

const styles = `
  ${layoutStyles}
  .intel-page{padding:28px;max-width:1200px;margin:0 auto;animation:fadeUp 0.4s ease both;}
  .intel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;}
  .intel-title{font-size:24px;font-weight:700;color:var(--primary);}
  .intel-subtitle{font-size:14px;color:var(--text-muted);margin-top:2px;}
  .loc-badge{display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:13px;color:var(--text-muted);}
  .loc-badge i{color:var(--accent);}

  .section-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-light);margin-bottom:12px;}
  .section-title{font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;}
  .section-desc{font-size:13px;color:var(--text-muted);margin-bottom:18px;}

  .cond-grid{display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:16px;margin-bottom:20px;}
  @media(max-width:900px){.cond-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:500px){.cond-grid{grid-template-columns:1fr;}}

  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px 22px;box-shadow:var(--card-shadow);transition:box-shadow 0.2s;}
  .stat-card:hover{box-shadow:var(--card-shadow-hover);}
  .stat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:16px;}
  .stat-val{font-size:26px;font-weight:700;color:var(--text);line-height:1;}
  .stat-unit{font-size:13px;color:var(--text-muted);margin-top:2px;}
  .stat-label{font-size:12px;color:var(--text-light);margin-top:6px;}

  .score-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px 22px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .score-title{font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:12px;text-align:center;}

  .chart-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px 22px;box-shadow:var(--card-shadow);margin-bottom:20px;}
  .chart-title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:16px;}
  .bar-row{display:flex;align-items:flex-end;gap:8px;height:90px;}
  .bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;}
  .bar{width:100%;border-radius:6px 6px 0 0;min-height:4px;background:var(--accent);transition:height 0.6s ease;}
  .bar-lbl{font-size:9px;color:var(--text-light);text-align:center;}
  .bar-val{font-size:9px;color:var(--text-muted);text-align:center;}

  .soil-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;}
  @media(max-width:600px){.soil-row{grid-template-columns:1fr 1fr;}}

  /* Advisor section */
  .advisor-top{display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap;}
  .crop-select{height:42px;padding:0 14px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;cursor:pointer;transition:border-color 0.2s;}
  .crop-select:focus{border-color:var(--primary);}
  .btn-primary{height:42px;padding:0 22px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s,transform 0.15s;}
  .btn-primary:hover{background:var(--primary-hover);transform:translateY(-1px);}
  .btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

  .advice-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
  @media(max-width:1000px){.advice-grid{grid-template-columns:1fr 1fr;}}
  @media(max-width:550px){.advice-grid{grid-template-columns:1fr;}}

  .advice-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;gap:10px;}
  .advice-head{display:flex;align-items:center;gap:10px;}
  .advice-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
  .advice-name{font-size:13px;font-weight:700;color:var(--text);}
  .advice-text{font-size:13px;color:var(--text-muted);line-height:1.5;flex:1;}
  .priority-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;width:fit-content;}
  .priority-high  {background:#FDECEA;color:#C62828;}
  .priority-medium{background:#FFF8E1;color:#E65100;}
  .priority-low   {background:#E8F5E9;color:#2E7D32;}

  /* Calendar section */
  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;}
  @media(max-width:1000px){.cal-grid{grid-template-columns:repeat(4,1fr);}}
  @media(max-width:600px) {.cal-grid{grid-template-columns:repeat(2,1fr);}}

  .cal-card{background:var(--card);border-radius:14px;padding:14px 12px;box-shadow:var(--card-shadow);border-left:3px solid transparent;display:flex;flex-direction:column;gap:6px;transition:box-shadow 0.2s;}
  .cal-card:hover{box-shadow:var(--card-shadow-hover);}
  .cal-card.urgent  {border-left-color:#EF5350;}
  .cal-card.moderate{border-left-color:#FFB74D;}
  .cal-card.routine {border-left-color:#66BB6A;}
  .cal-day  {font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-light);}
  .cal-date {font-size:12px;color:var(--text-muted);}
  .cal-weather{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);}
  .cal-tasks{display:flex;flex-direction:column;gap:4px;margin-top:4px;}
  .cal-task{font-size:12px;color:var(--text);line-height:1.4;padding-left:10px;position:relative;}
  .cal-task::before{content:'';position:absolute;left:0;top:6px;width:5px;height:5px;border-radius:50%;background:var(--accent);}

  .loading-box{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.7s linear infinite;}
  .load-txt{font-size:14px;color:var(--text-muted);}
  .error-box{background:#FFF3F3;border:1px solid #FFCDD2;border-radius:12px;padding:16px;color:#C62828;font-size:14px;display:flex;align-items:center;gap:10px;margin-bottom:20px;}
`;

function CircleScore({ score }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const arc  = (score / 100) * circ;
  const color = score < 40 ? "#EF5350" : score < 70 ? "#FFB74D" : "#4CAF50";
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#E0D8CC" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x="60" y="54" textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="Outfit,sans-serif">{score}</text>
      <text x="60" y="71" textAnchor="middle" fontSize="11" fill="#7A9080" fontFamily="Outfit,sans-serif">/ 100</text>
    </svg>
  );
}

function RainChart({ forecast, title }) {
  const maxRain = Math.max(...forecast.map(d => d.rain || 0), 5);
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <div className="bar-row">
        {forecast.map((d, i) => {
          const pct = Math.round(((d.rain || 0) / maxRain) * 90);
          return (
            <div key={i} className="bar-wrap">
              <div className="bar-val">{d.rain}</div>
              <div className="bar" style={{ height: `${Math.max(pct, 4)}%`, opacity: d.rain > 0 ? 1 : 0.3 }} />
              <div className="bar-lbl">{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityBadge({ level }) {
  const cls = `priority-badge priority-${(level || "low").toLowerCase()}`;
  const icons = { high: "fa-circle-exclamation", medium: "fa-circle-dot", low: "fa-circle-check" };
  return (
    <span className={cls}>
      <i className={`fa-solid ${icons[(level || "low").toLowerCase()] || "fa-circle"}`} />
      {(level || "low").charAt(0).toUpperCase() + (level || "low").slice(1)}
    </span>
  );
}

function StatCard({ icon, iconBg, iconColor, value, unit, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="stat-val">{value}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)", marginLeft: 2 }}>{unit}</span></div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Intelligence() {
  const { t } = useTranslation();
  const coords    = useLocationCoords();
  const activeLoc = useActiveLocation();
  const useLive   = useLocationStore((s) => s.useLive);
  const permission= useLocationStore((s) => s.permission);
  const refreshLive = useLocationStore((s) => s.refreshLive);

  const [cityName, setCityName]     = useState(activeLoc?.city || "");
  const [gpsError, setGpsError]     = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [weather, setWeather]       = useState(null);
  const [soil, setSoil]             = useState(null);
  const [dataError, setDataError]   = useState("");

  const [crop, setCrop]             = useState("Wheat");
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [advice, setAdvice]         = useState(null);
  const [adviceError, setAdviceError] = useState("");

  const [calLoading, setCalLoading] = useState(false);
  const [calendar, setCalendar]     = useState(null);

  const [fieldScore, setFieldScore] = useState(null);

  // Sync display city from the active location.
  useEffect(() => {
    if (activeLoc?.city) setCityName(activeLoc.city);
    else if (activeLoc?.display) setCityName(activeLoc.display);
  }, [activeLoc?.display, activeLoc?.city]);

  // Re-fetch field data whenever coords or active place change.
  useEffect(() => {
    if (useLive && !coords) {
      // Try to get coords if we don't have them yet.
      if (permission !== "denied" && permission !== "unsupported") {
        refreshLive();
      } else if (permission === "denied") {
        setGpsError("Location access denied. Enable GPS for live field data, or set a custom location in Profile.");
      } else if (permission === "unsupported") {
        setGpsError("Geolocation not supported by this browser.");
      }
      return;
    }
    if (coords) {
      setGpsError("");
      loadFieldData(coords.lat, coords.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lon, useLive, permission]);

  const loadFieldData = async (lat, lon) => {
    setDataLoading(true);
    setDataError("");
    try {
      const [wRes, sRes] = await Promise.all([
        client.get(`/api/intelligence/weather?lat=${lat}&lon=${lon}`),
        client.get(`/api/intelligence/soil?lat=${lat}&lon=${lon}`),
      ]);
      setWeather(wRes.data);
      setSoil(sRes.data);
      if (wRes.data.current?.city) setCityName(wRes.data.current.city);

      // Calculate initial field score from data
      const sm = sRes.data.soil?.soilMoisture || 50;
      const hum = wRes.data.current?.humidity || 60;
      const tmp = wRes.data.current?.temp || 25;
      let score = 50;
      if (sm > 30 && sm < 80) score += 15;
      if (hum > 40 && hum < 80) score += 10;
      if (tmp > 15 && tmp < 35) score += 15;
      if (sRes.data.soil?.avgRainfall > 1) score += 10;
      setFieldScore(Math.min(100, score));
    } catch (err) {
      setDataError("Failed to load field data. " + (err.response?.data?.message || err.message));
    } finally {
      setDataLoading(false);
    }
  };

  const getAdvice = async () => {
    if (!weather || !soil) return;
    setAdviceLoading(true);
    setAdviceError("");
    setAdvice(null);
    setCalendar(null);
    try {
      const res = await client.post("/api/intelligence/advice", {
        weatherData: weather.current,
        soilData:    soil.soil,
        cropName:    crop,
        location:    activeLoc?.display || cityName || "India",
      });
      setAdvice(res.data.advice);
      if (res.data.advice?.fieldHealthScore) setFieldScore(res.data.advice.fieldHealthScore);
      fetchCalendar();
    } catch (err) {
      setAdviceError("AI advice unavailable. " + (err.response?.data?.message || err.message));
    } finally {
      setAdviceLoading(false);
    }
  };

  const fetchCalendar = async () => {
    setCalLoading(true);
    try {
      const res = await client.post("/api/intelligence/calendar", {
        cropName:       crop,
        weatherForecast: weather?.forecast,
        location:       activeLoc?.display || cityName || "India",
      });
      setCalendar(res.data.calendar);
    } catch {
      // calendar is non-critical, fail silently
    } finally {
      setCalLoading(false);
    }
  };

  const adviceCards = advice ? [
    {
      key: "irrigation",
      icon: "fa-droplet", iconBg: "#E3F2FD", iconColor: "#1565C0",
      title: "Irrigation",
      text:  advice.irrigation?.reason || "—",
      status: advice.irrigation?.needed ? "Needed" : "Not needed",
      priority: advice.irrigation?.priority,
    },
    {
      key: "pest",
      icon: "fa-bug", iconBg: "#FCE4EC", iconColor: "#AD1457",
      title: "Pest Risk",
      text:  advice.pestRisk?.details || "—",
      status: advice.pestRisk?.risk || "—",
      priority: advice.pestRisk?.risk,
    },
    {
      key: "fertilizer",
      icon: "fa-flask", iconBg: "#E8F5E9", iconColor: "#2E7D32",
      title: "Fertilizer",
      text:  advice.fertilizer?.timing || "—",
      status: advice.fertilizer?.needed ? "Needed" : "Not needed",
      priority: advice.fertilizer?.priority,
    },
    {
      key: "action",
      icon: "fa-triangle-exclamation", iconBg: "#FFF8E1", iconColor: "#E65100",
      title: "Critical Action",
      text:  advice.criticalAction?.action || "—",
      status: advice.criticalAction?.deadline || "—",
      priority: advice.criticalAction?.priority,
    },
  ] : [];

  return (
    <AppLayout pageId="intelligence">
      <style>{styles}</style>
      <div className="intel-page">

        {/* Header */}
        <div className="intel-header">
          <div>
            <div className="intel-title">{t("intelligence.title")}</div>
            <div className="intel-subtitle">{t("intelligence.subtitle")}</div>
          </div>
          <div className="loc-badge" title={useLive ? "Live GPS location" : "Saved location"}>
            <i className={`fa-solid ${useLive ? "fa-location-crosshairs" : "fa-location-dot"}`} />
            {activeLoc?.display || cityName || (coords ? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}` : t("intelligence.detectingLoc"))}
            {useLive && coords && (
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#1ABC55",
                             marginLeft:6,animation:"pulse 2s infinite" }} />
            )}
          </div>
        </div>

        {/* GPS Error */}
        {gpsError && (
          <div className="error-box">
            <i className="fa-solid fa-location-crosshairs" />
            {gpsError}
          </div>
        )}

        {/* ── SECTION A: Live Field Conditions ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">{t("intelligence.sectionA")}</div>
          <div className="section-title">{t("intelligence.sectionATitle")}</div>
          <div className="section-desc">{t("intelligence.sectionADesc")}</div>

          {dataLoading && (
            <div className="loading-box">
              <div className="spinner" />
              <div className="load-txt">{t("intelligence.fetchingData")}</div>
            </div>
          )}

          {dataError && !dataLoading && (
            <div className="error-box"><i className="fa-solid fa-circle-exclamation" />{dataError}</div>
          )}

          {weather && soil && !dataLoading && (
            <>
              <div className="cond-grid">
                {/* Field Health Score */}
                <div className="score-card">
                  <div className="score-title">{t("intelligence.fieldHealthScore")}</div>
                  <CircleScore score={fieldScore || 60} />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
                    {(fieldScore || 60) >= 70 ? t("intelligence.goodCondition") : (fieldScore || 60) >= 40 ? t("intelligence.monitorClosely") : t("intelligence.needsAttention")}
                  </div>
                </div>
                <StatCard icon="fa-temperature-high" iconBg="#FFF3E0" iconColor="#E65100"
                  value={weather.current.temp} unit="°C" label={t("intelligence.feelsLike", { temp: weather.current.feelsLike })} />
                <StatCard icon="fa-droplets" iconBg="#E3F2FD" iconColor="#1565C0"
                  value={weather.current.humidity} unit="%" label={t("intelligence.relHumidity")} />
                <StatCard icon="fa-wind" iconBg="#F3E5F5" iconColor="#6A1B9A"
                  value={weather.current.windSpeed} unit=" km/h" label={t("intelligence.windSpeed")} />
              </div>

              {/* Rain bar chart */}
              {weather.forecast?.length > 0 && <RainChart forecast={weather.forecast} title={t("intelligence.rainfallChart")} />}

              {/* Soil row */}
              <div className="soil-row">
                <StatCard icon="fa-water" iconBg="#E0F2F1" iconColor="#00695C"
                  value={soil.soil.soilMoisture} unit="%" label={t("intelligence.soilMoistureLabel", { interp: soil.soil.interpretation })} />
                <StatCard icon="fa-cloud-rain" iconBg="#E3F2FD" iconColor="#1565C0"
                  value={soil.soil.totalRainfall30d} unit=" mm" label={t("intelligence.totalRainfall")} />
                <StatCard icon="fa-thermometer-half" iconBg="#FFF8E1" iconColor="#F57F17"
                  value={soil.soil.avgTemp} unit="°C" label={t("intelligence.avgTemp")} />
              </div>
            </>
          )}

          {!weather && !dataLoading && !dataError && !gpsError && (
            <div className="loading-box"><div className="spinner" /><div className="load-txt">{t("intelligence.gettingLocation")}</div></div>
          )}
        </div>

        {/* ── SECTION B: AI Crop Advisor ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">{t("intelligence.sectionB")}</div>
          <div className="section-title">{t("intelligence.sectionBTitle")}</div>
          <div className="section-desc">{t("intelligence.sectionBDesc")}</div>

          <div className="advisor-top">
            <select className="crop-select" value={crop} onChange={e => setCrop(e.target.value)}>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn-primary" onClick={getAdvice}
              disabled={adviceLoading || !weather || !soil}>
              {adviceLoading
                ? <><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /> {t("intelligence.analyzing")}</>
                : <><i className="fa-solid fa-brain" /> {t("intelligence.getAdviceBtn")}</>}
            </button>
          </div>

          {adviceError && <div className="error-box"><i className="fa-solid fa-circle-exclamation" />{adviceError}</div>}

          {adviceLoading && !advice && (
            <div className="loading-box">
              <div className="spinner" />
              <div className="load-txt">{t("intelligence.analyzingField")}</div>
            </div>
          )}

          {advice && (
            <div className="advice-grid">
              {adviceCards.map(card => (
                <div key={card.key} className="advice-card">
                  <div className="advice-head">
                    <div className="advice-icon" style={{ background: card.iconBg, color: card.iconColor }}>
                      <i className={`fa-solid ${card.icon}`} />
                    </div>
                    <div className="advice-name">{card.title}</div>
                  </div>
                  <div className="advice-text">{card.text}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{card.status}</span>
                    <PriorityBadge level={card.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION C: 7-Day Farm Calendar ── */}
        {(calLoading || calendar) && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-label">{t("intelligence.sectionC")}</div>
            <div className="section-title">{t("intelligence.sectionCTitle")}</div>
            <div className="section-desc">{t("intelligence.sectionCDesc")}</div>

            {calLoading && (
              <div className="loading-box"><div className="spinner" /><div className="load-txt">{t("intelligence.buildingCalendar")}</div></div>
            )}

            {calendar && !calLoading && (
              <div className="cal-grid">
                {calendar.map((day, i) => (
                  <div key={i} className={`cal-card ${day.urgency || "routine"}`}>
                    <div className="cal-day">{day.day}</div>
                    <div className="cal-date">{day.date}</div>
                    <div className="cal-weather">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weatherIcon || "01d"}.png`}
                        alt="" width="22" height="22" style={{ flexShrink: 0 }}
                      />
                      <span>{day.temp}°C · {day.rain}mm</span>
                    </div>
                    <div className="cal-tasks">
                      {(day.tasks || []).map((t, j) => (
                        <div key={j} className="cal-task">{t}</div>
                      ))}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 6 }}>
                      <span className={`priority-badge priority-${day.urgency === "urgent" ? "high" : day.urgency === "moderate" ? "medium" : "low"}`}>
                        {day.urgency || "routine"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
